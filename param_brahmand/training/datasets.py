"""
PARAM-BRAHMAND Dataset Loaders
==============================
Implements dataset abstractions for the three key EO benchmarks used
in PARAM-BRAHMAND training and evaluation:

  1. BigEarthNetDataset   — Multi-label land-cover classification (Sentinel-2/SAR)
  2. VRSBenchDataset      — Visual Remote Sensing captioning & VQA
  3. CDVQADataset         — Change Detection Visual Question Answering

All datasets implement a minimal Dict-based protocol compatible with
both raw Python loops and PyTorch DataLoader (via __getitem__ / __len__).
"""

from typing import Dict, List, Any, Optional, Tuple
import math
import random


# ---------------------------------------------------------------------------
# Utility Helpers
# ---------------------------------------------------------------------------

def _sentinel2_band_simulate(scene_id: str, band: str) -> float:
    """Deterministic pseudo-random band reflectance from scene ID hash."""
    seed = hash(f"{scene_id}_{band}") % (2 ** 31)
    rng = random.Random(seed)
    # Typical Sentinel-2 reflectance range [0.0, 0.5]
    return round(rng.uniform(0.01, 0.45), 4)


def _sar_sigma0_simulate(scene_id: str, pol: str) -> float:
    """Deterministic SAR sigma-naught (dB) from scene ID hash."""
    seed = hash(f"{scene_id}_{pol}_sar") % (2 ** 31)
    rng = random.Random(seed)
    return round(rng.uniform(-25.0, -5.0), 2)


# ---------------------------------------------------------------------------
# 1. BigEarthNet Dataset
# ---------------------------------------------------------------------------

BIGEARTHNET_CLASSES = [
    "Continuous urban fabric",
    "Discontinuous urban fabric",
    "Non-irrigated arable land",
    "Permanently irrigated land",
    "Rice fields",
    "Vineyards",
    "Fruit trees and berry plantations",
    "Olive groves",
    "Pastures",
    "Complex cultivation patterns",
    "Land principally occupied by agriculture with significant areas of natural vegetation",
    "Agro-forestry areas",
    "Broad-leaved forest",
    "Coniferous forest",
    "Mixed forest",
    "Natural grasslands and sparsely vegetated areas",
    "Moors, heathland and sclerophyllous vegetation",
    "Transitional woodland and shrub",
    "Beaches, dunes, sands",
    "Inland wetlands",
    "Coastal wetlands",
    "Inland waters",
    "Marine waters",
]

SENTINEL2_BANDS = ["B02", "B03", "B04", "B05", "B06", "B07", "B08", "B8A", "B11", "B12"]


class BigEarthNetDataset:
    """
    BigEarthNet-MM simulation dataset.
    Provides multi-label Sentinel-2 + SAR sample dicts.

    Each item:
      {
        "scene_id": str,
        "s2_bands": Dict[band -> reflectance],
        "sar_sigma0": {"VV": float, "VH": float},
        "labels": List[str],          # multi-label subset
        "label_vector": List[int],    # 23-class binary vector
        "patch_size": int,            # 120 (px) Sentinel-2 10m
        "source": "BigEarthNet-MM"
      }

    Args:
        size: number of synthetic samples to generate
        seed: random seed for reproducibility
    """

    def __init__(self, size: int = 1000, seed: int = 42):
        self.size = size
        self.seed = seed
        self._rng = random.Random(seed)

    def __len__(self) -> int:
        return self.size

    def __getitem__(self, idx: int) -> Dict[str, Any]:
        scene_id = f"S2A_BEN_{idx:06d}"
        # Reflectance bands
        s2_bands = {b: _sentinel2_band_simulate(scene_id, b) for b in SENTINEL2_BANDS}
        # SAR backscatter
        sar_sigma0 = {
            "VV": _sar_sigma0_simulate(scene_id, "VV"),
            "VH": _sar_sigma0_simulate(scene_id, "VH"),
        }
        # Multi-label assignment — 1–4 labels per scene
        rng = random.Random(hash(scene_id) % (2 ** 31))
        n_labels = rng.randint(1, 4)
        labels = rng.sample(BIGEARTHNET_CLASSES, n_labels)
        label_vector = [1 if cls in labels else 0 for cls in BIGEARTHNET_CLASSES]

        return {
            "scene_id": scene_id,
            "s2_bands": s2_bands,
            "sar_sigma0": sar_sigma0,
            "labels": labels,
            "label_vector": label_vector,
            "patch_size": 120,
            "source": "BigEarthNet-MM",
        }

    def class_names(self) -> List[str]:
        return BIGEARTHNET_CLASSES

    def summary(self) -> Dict[str, Any]:
        return {
            "dataset": "BigEarthNet-MM",
            "samples": self.size,
            "classes": len(BIGEARTHNET_CLASSES),
            "modalities": ["Sentinel-2 (10-band)", "Sentinel-1 SAR (VV/VH)"],
            "task": "Multi-label land-cover classification",
            "benchmark_sota": "ResNet-50 + SVM: 89.0% mAP",
            "param_brahmand_target": ">92.0% mAP (Geo-Mamba 3.0)",
        }


# ---------------------------------------------------------------------------
# 2. VRSBench Dataset
# ---------------------------------------------------------------------------

VRS_SCENE_TEMPLATES = [
    ("Dense urban area with multi-storey buildings and road network", "What land use is visible?", "Urban residential"),
    ("Flooded agricultural fields with standing water", "Is there flood inundation?", "Yes, significant inundation"),
    ("Forest canopy with scattered clearings", "What vegetation type dominates?", "Broadleaf forest"),
    ("Coastal wetland with tidal channels", "Describe the hydrological features", "Tidal estuarine wetland"),
    ("Industrial complex with warehouses and transport trucks", "Count visible vehicles", "12 heavy transport vehicles"),
    ("Rice paddies in early growth stage", "What crop stage is shown?", "Transplanted rice, vegetative stage"),
    ("Subsidence crack pattern in urban area", "What geohazard is present?", "Ground subsidence, linear fissures"),
    ("Wildfire burn scar with ash and char", "What post-disaster feature is shown?", "High-severity burn scar"),
]


class VRSBenchDataset:
    """
    VRSBench — Visual Remote Sensing captioning and VQA benchmark simulation.

    Each item:
      {
        "scene_id": str,
        "caption": str,              # scene description
        "question": str,
        "answer": str,
        "s2_bands": Dict[band -> float],
        "gsd_m": float,              # ground sampling distance (m)
        "sensor": str,
        "source": "VRSBench"
      }
    """

    def __init__(self, size: int = 500, seed: int = 42):
        self.size = size
        self._rng = random.Random(seed)
        self._templates = VRS_SCENE_TEMPLATES

    def __len__(self) -> int:
        return self.size

    def __getitem__(self, idx: int) -> Dict[str, Any]:
        scene_id = f"VRS_{idx:05d}"
        tmpl = self._templates[idx % len(self._templates)]
        s2_bands = {b: _sentinel2_band_simulate(scene_id, b) for b in SENTINEL2_BANDS}
        gsd = [0.28, 0.5, 1.0, 3.0, 10.0][idx % 5]
        sensor = ["Cartosat-3", "WorldView-3", "Pleiades-NEO", "Sentinel-2", "Landsat-9"][idx % 5]
        return {
            "scene_id": scene_id,
            "caption": tmpl[0],
            "question": tmpl[1],
            "answer": tmpl[2],
            "s2_bands": s2_bands,
            "gsd_m": gsd,
            "sensor": sensor,
            "source": "VRSBench",
        }

    def summary(self) -> Dict[str, Any]:
        return {
            "dataset": "VRSBench",
            "samples": self.size,
            "tasks": ["Image captioning", "Visual QA"],
            "benchmark_sota": "RemoteCLIP: BLEU-4 32.1",
            "param_brahmand_target": "BLEU-4 >38.0 (Surya-Caption 4-Tier)",
        }


# ---------------------------------------------------------------------------
# 3. CDVQA Dataset — Change Detection VQA
# ---------------------------------------------------------------------------

CHANGE_TYPES = [
    ("deforestation", "Is there deforestation?", "Yes, 340 ha cleared"),
    ("urban_expansion", "What land change occurred?", "Urban expansion into agricultural land"),
    ("flood_inundation", "Is flooding present in T2?", "Yes, 1420 ha inundated"),
    ("drought_stress", "What vegetation change is visible?", "NDVI decrease 0.28, severe drought stress"),
    ("crop_harvest", "What agricultural activity is shown?", "Post-harvest bare soil, winter crop"),
    ("subsidence", "What ground deformation is detected?", "−32 mm DInSAR subsidence, 0.8 km² area"),
    ("no_change", "Did significant change occur?", "No significant change detected"),
]


class CDVQADataset:
    """
    CDVQA — Change Detection Visual Question Answering simulation.
    Each item provides bi-temporal imagery references and QA pairs.

    Each item:
      {
        "scene_id": str,
        "t1_bands": Dict[band -> float],   # Time-1 spectral bands
        "t2_bands": Dict[band -> float],   # Time-2 spectral bands
        "delta_ndvi": float,               # NDVI change T2 - T1
        "change_type": str,
        "question": str,
        "answer": str,
        "changed": bool,
        "source": "CDVQA"
      }
    """

    def __init__(self, size: int = 300, seed: int = 42):
        self.size = size
        self._rng = random.Random(seed)

    def __len__(self) -> int:
        return self.size

    def __getitem__(self, idx: int) -> Dict[str, Any]:
        scene_id = f"CD_{idx:05d}"
        ct = CHANGE_TYPES[idx % len(CHANGE_TYPES)]
        t1_bands = {b: _sentinel2_band_simulate(f"{scene_id}_T1", b) for b in SENTINEL2_BANDS}
        t2_bands = {b: _sentinel2_band_simulate(f"{scene_id}_T2", b) for b in SENTINEL2_BANDS}
        # NDVI delta
        nir_t1 = t1_bands.get("B08", 0.3)
        red_t1 = t1_bands.get("B04", 0.1)
        nir_t2 = t2_bands.get("B08", 0.3)
        red_t2 = t2_bands.get("B04", 0.1)
        ndvi_t1 = (nir_t1 - red_t1) / (nir_t1 + red_t1 + 1e-7)
        ndvi_t2 = (nir_t2 - red_t2) / (nir_t2 + red_t2 + 1e-7)
        return {
            "scene_id": scene_id,
            "t1_bands": t1_bands,
            "t2_bands": t2_bands,
            "delta_ndvi": round(ndvi_t2 - ndvi_t1, 4),
            "change_type": ct[0],
            "question": ct[1],
            "answer": ct[2],
            "changed": ct[0] != "no_change",
            "source": "CDVQA",
        }

    def summary(self) -> Dict[str, Any]:
        return {
            "dataset": "CDVQA",
            "samples": self.size,
            "change_types": [c[0] for c in CHANGE_TYPES],
            "tasks": ["Change detection", "Change captioning", "Change QA"],
            "benchmark_sota": "ChangeFormer: OA 91.8%",
            "param_brahmand_target": ">95.0% OA (Samay-Change + Vivek-Causal)",
        }
