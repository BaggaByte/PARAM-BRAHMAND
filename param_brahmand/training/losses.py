"""
Layer 0 — Physics-Guided Multi-Task Loss
=========================================
Implements the composite training objective for Geo-Mamba 3.0:

    L_total = λ1·L_CIDEr + λ2·L_Dice + λ3·L_SADF + λ4·L_Physics

Where:
  L_CIDEr  — Captioning quality (SPICE-augmented consensus-based image description)
  L_Dice   — Segmentation mask overlap (1 − 2|P∩G|/(|P|+|G|))
  L_SADF   — Scale-Aware Density Field regression (SSIM + MAE)
  L_Physics — Stokes/radiometric consistency penalty (invariant postulate violations)

No ML framework required — pure-Python reference implementation.
"""

from typing import Dict, List, Tuple, Optional
import math


# ---------------------------------------------------------------------------
# 1. Caption Loss — CIDEr-D Approximation
# ---------------------------------------------------------------------------

def _ngrams(tokens: List[str], n: int) -> Dict[str, int]:
    """Count n-grams in a token list."""
    counts: Dict[str, int] = {}
    for i in range(len(tokens) - n + 1):
        gram = " ".join(tokens[i : i + n])
        counts[gram] = counts.get(gram, 0) + 1
    return counts


def _cider_d_score(hypothesis: str, references: List[str], n_max: int = 4) -> float:
    """
    Simplified CIDEr-D scoring without IDF weighting.
    Returns a scalar in [0, 10].
    """
    hyp_tokens = hypothesis.lower().split()
    total = 0.0
    for n in range(1, n_max + 1):
        hyp_ng = _ngrams(hyp_tokens, n)
        hyp_len = sum(hyp_ng.values()) or 1
        ref_scores = []
        for ref in references:
            ref_tokens = ref.lower().split()
            ref_ng = _ngrams(ref_tokens, n)
            ref_len = sum(ref_ng.values()) or 1
            common = sum(min(hyp_ng.get(k, 0), ref_ng[k]) for k in ref_ng)
            precision = common / hyp_len
            recall = common / ref_len
            f1 = (2 * precision * recall / (precision + recall)) if (precision + recall) > 0 else 0.0
            ref_scores.append(f1)
        total += max(ref_scores) if ref_scores else 0.0
    return (total / n_max) * 10.0


def cider_loss(hypothesis: str, references: List[str]) -> float:
    """CIDEr captioning loss (lower is better — inverted score)."""
    score = _cider_d_score(hypothesis, references)
    return max(0.0, 10.0 - score)


# ---------------------------------------------------------------------------
# 2. Dice Loss — Binary Segmentation
# ---------------------------------------------------------------------------

def dice_loss(
    pred_mask: List[float],
    gt_mask: List[float],
    smooth: float = 1e-6,
) -> float:
    """
    Binary Dice loss for flat mask vectors.
    pred_mask: sigmoid probabilities in [0, 1]
    gt_mask:   ground-truth binary labels in {0, 1}
    """
    if len(pred_mask) != len(gt_mask):
        raise ValueError("pred_mask and gt_mask must have equal length")
    intersection = sum(p * g for p, g in zip(pred_mask, gt_mask))
    pred_sum = sum(p for p in pred_mask)
    gt_sum = sum(g for g in gt_mask)
    dice = (2.0 * intersection + smooth) / (pred_sum + gt_sum + smooth)
    return 1.0 - dice


# ---------------------------------------------------------------------------
# 3. SADF Loss — Scale-Aware Density Field
# ---------------------------------------------------------------------------

def _ssim_1d(x: List[float], y: List[float], c1: float = 0.01 ** 2, c2: float = 0.03 ** 2) -> float:
    """Simplified 1-D SSIM over flattened density map."""
    n = len(x)
    if n == 0:
        return 1.0
    mu_x = sum(x) / n
    mu_y = sum(y) / n
    var_x = sum((v - mu_x) ** 2 for v in x) / n
    var_y = sum((v - mu_y) ** 2 for v in y) / n
    cov_xy = sum((xi - mu_x) * (yi - mu_y) for xi, yi in zip(x, y)) / n
    ssim = ((2 * mu_x * mu_y + c1) * (2 * cov_xy + c2)) / (
        (mu_x ** 2 + mu_y ** 2 + c1) * (var_x + var_y + c2)
    )
    return ssim


def sadf_loss(
    pred_density: List[float],
    gt_density: List[float],
    alpha: float = 0.5,
) -> float:
    """
    Scale-Aware Density Field loss combining SSIM and MAE.
    L_SADF = α·(1 − SSIM) + (1 − α)·MAE_normalized
    """
    if len(pred_density) != len(gt_density):
        raise ValueError("pred_density and gt_density must have equal length")
    ssim_val = _ssim_1d(pred_density, gt_density)
    mae = sum(abs(p - g) for p, g in zip(pred_density, gt_density)) / (len(pred_density) or 1)
    mae_norm = mae / (max(gt_density) + 1e-7) if gt_density else mae
    return alpha * (1.0 - ssim_val) + (1.0 - alpha) * mae_norm


# ---------------------------------------------------------------------------
# 4. Physics Consistency Loss — Stokes / Radiometric Invariant Penalty
# ---------------------------------------------------------------------------

def physics_consistency_loss(
    stokes_pred: Dict[str, float],
    stokes_gt: Dict[str, float],
    albedo_pred: float,
    albedo_gt: float,
    solar_zenith_deg: float = 30.0,
) -> float:
    """
    Penalises violations of 4 radiometric invariant postulates:
      P1: |I_pred - I_gt| / I_gt              — Stokes I flux conservation
      P2: sqrt((Q² + U² + V²)) <= I (Pol. bound)
      P3: Albedo in [0, 1]
      P4: cos(solar_zenith) > 0               — valid illumination
    Returns aggregate violation score in [0, 1].
    """
    violations = 0.0
    count = 0

    # P1 — Stokes I consistency
    i_pred = stokes_pred.get("I", 0.0)
    i_gt = stokes_gt.get("I", 1.0)
    p1 = abs(i_pred - i_gt) / (abs(i_gt) + 1e-7)
    violations += min(1.0, p1)
    count += 1

    # P2 — Polarisation bound: pol_deg <= 1
    q = stokes_pred.get("Q", 0.0)
    u = stokes_pred.get("U", 0.0)
    v = stokes_pred.get("V", 0.0)
    pol_deg = math.sqrt(q ** 2 + u ** 2 + v ** 2) / (abs(i_pred) + 1e-7)
    p2 = max(0.0, pol_deg - 1.0)
    violations += min(1.0, p2)
    count += 1

    # P3 — Albedo physical bounds
    p3 = 0.0 if 0.0 <= albedo_pred <= 1.0 else abs(albedo_pred - max(0.0, min(1.0, albedo_pred)))
    violations += min(1.0, p3)
    count += 1

    # P4 — Solar illumination validity
    cos_sz = math.cos(math.radians(solar_zenith_deg))
    p4 = 0.0 if cos_sz > 0 else 1.0
    violations += p4
    count += 1

    return violations / count


# ---------------------------------------------------------------------------
# 5. Composite Multi-Task Loss
# ---------------------------------------------------------------------------

class PhysicsGuidedMultiTaskLoss:
    """
    Composite physics-guided multi-task training objective for Geo-Mamba 3.0.

    Usage:
        loss_fn = PhysicsGuidedMultiTaskLoss(lambda1=1.0, lambda2=1.5, lambda3=1.0, lambda4=2.0)
        total, breakdown = loss_fn.compute(batch)
    """

    def __init__(
        self,
        lambda1: float = 1.0,   # CIDEr caption weight
        lambda2: float = 1.5,   # Dice segmentation weight
        lambda3: float = 1.0,   # SADF density weight
        lambda4: float = 2.0,   # Physics consistency weight (highest — hard constraint)
    ):
        self.lambda1 = lambda1
        self.lambda2 = lambda2
        self.lambda3 = lambda3
        self.lambda4 = lambda4

    def compute(self, batch: Dict) -> Tuple[float, Dict[str, float]]:
        """
        Compute composite loss from a batch dict with keys:
          - hypothesis (str): predicted caption
          - references (List[str]): reference captions
          - pred_mask (List[float]): predicted segmentation
          - gt_mask (List[float]): ground truth mask
          - pred_density (List[float]): predicted density field
          - gt_density (List[float]): GT density field
          - stokes_pred (Dict): predicted Stokes params
          - stokes_gt (Dict): GT Stokes params
          - albedo_pred (float)
          - albedo_gt (float)
          - solar_zenith_deg (float, optional)

        Returns (total_loss, component_breakdown).
        """
        l_cider = cider_loss(
            batch.get("hypothesis", ""),
            batch.get("references", [""]),
        )
        l_dice = dice_loss(
            batch.get("pred_mask", [0.5]),
            batch.get("gt_mask", [1.0]),
        )
        l_sadf = sadf_loss(
            batch.get("pred_density", [0.5]),
            batch.get("gt_density", [1.0]),
        )
        l_physics = physics_consistency_loss(
            stokes_pred=batch.get("stokes_pred", {"I": 1.0, "Q": 0.0, "U": 0.0, "V": 0.0}),
            stokes_gt=batch.get("stokes_gt", {"I": 1.0, "Q": 0.0, "U": 0.0, "V": 0.0}),
            albedo_pred=batch.get("albedo_pred", 0.3),
            albedo_gt=batch.get("albedo_gt", 0.3),
            solar_zenith_deg=batch.get("solar_zenith_deg", 30.0),
        )

        total = (
            self.lambda1 * l_cider
            + self.lambda2 * l_dice
            + self.lambda3 * l_sadf
            + self.lambda4 * l_physics
        )

        breakdown = {
            "l_cider": round(l_cider, 6),
            "l_dice": round(l_dice, 6),
            "l_sadf": round(l_sadf, 6),
            "l_physics": round(l_physics, 6),
            "total": round(total, 6),
            "weights": {
                "lambda1": self.lambda1,
                "lambda2": self.lambda2,
                "lambda3": self.lambda3,
                "lambda4": self.lambda4,
            },
        }
        return total, breakdown
