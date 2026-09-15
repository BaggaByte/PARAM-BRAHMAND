import type { AgentId, AgentInfo, LayerInfo } from "./types";

export const AGENTS: AgentInfo[] = [
  {
    id: "bhoomi_optical",
    sanskrit: "भूमि",
    name: "Bhoomi-Optical",
    domain: "Sub-decimeter Optical VQA & Object Counting",
    mechanism: "Scale-Aware Density Fields (SADF) + SIRTI",
    metric: "91.4% OA · 93.8% Cartosat-2S",
    description:
      "Specialized in sub-decimeter optical intelligence. Processes Cartosat-3 (0.28m) and Cartosat-2S (0.8m) imagery through continuous Scale-Aware Density Fields (SADF) to count micro-objects (vehicles, temporary shelters, damaged roofs) without suffering scale-transition artifacts.",
    mathematics:
      "D(x, y) = \\sum_{i} \\frac{1}{2\\pi \\sigma_i^2} \\exp\\left(-\\frac{(x-x_i)^2 + (y-y_i)^2}{2\\sigma_i^2}\\right) \\cdot \\text{SiLU}(W_\\theta \\cdot e_{GSD})",
    sensors: ["Cartosat-3 (0.28m PAN / 1.12m MX)", "Cartosat-2S (0.8m)", "Sentinel-2 (10m)"],
    benchmarks: [
      {
        dataset: "RSVQA-HR Optical VQA",
        metric: "Overall Accuracy (OA)",
        sota: "86.1%",
        ours: "91.4%",
        delta: "+6.2%",
      },
      {
        dataset: "ISRO Cartosat-2S Set",
        metric: "VQA Accuracy",
        sota: "81.0%",
        ours: "93.8%",
        delta: "+15.8% (via SIRTI)",
      },
    ],
    sampleQuery: "Count emergency response vehicles and assess road passability",
  },
  {
    id: "kaal_radar",
    sanskrit: "काल",
    name: "Kaal-Radar",
    domain: "Cloud-Penetrating SAR & Sub-Canopy Inundation",
    mechanism: "PolInSAR RVoG Canopy Inversion & Pd Double Bounce",
    metric: "97.2% Flood Precision under 100% clouds",
    description:
      "Penetrates 100% dense monsoon cloud decks and dense forest canopies using dual-pol and quad-pol SAR interferometry. Distinguishes specular open-water attenuation (σ⁰VV < -18 dB) from trunk-water dihedral double-bounce spikes (Pd > 0.55), mapping submerged settlements that optical sensors cannot detect.",
    mathematics:
      "\\gamma(w) = e^{j \\phi_0} \\left[ \\frac{\\gamma_v + \\mu(w)}{1 + \\mu(w)} \\right], \\quad h_v = \\frac{\\Delta \\phi}{k_z}, \\quad k_z = \\frac{4\\pi B_\\perp}{\\lambda R \\sin\\theta_{inc}}",
    sensors: ["RISAT-1A (C-band SAR)", "NISAR (L+S Band)", "Sentinel-1 (C-band)"],
    benchmarks: [
      {
        dataset: "100% Cloud Flood Set",
        metric: "Flood Detection Precision",
        sota: "74.5%",
        ours: "97.2%",
        delta: "+22.7%",
      },
      {
        dataset: "ISRO RISAT SAR Set",
        metric: "Grounding Precision",
        sota: "78.2%",
        ours: "91.2%",
        delta: "+16.6% (via AG4U)",
      },
    ],
    sampleQuery: "Map flood water under tree canopy in Kaziranga",
  },
  {
    id: "surya_caption",
    sanskrit: "सूर्य",
    name: "Surya-Caption",
    domain: "4-Tier Automated Remote Sensing Scene Description",
    mechanism: "Brief · Tactical · Forensic · Telemetry Generation",
    metric: "138.4 CIDEr · 0.442 BLEU-4",
    description:
      "Translates complex multidimensional physical manifolds into standardized 4-tier decision briefs: Tier 1 (Executive Summary for Cabinet/NDMA), Tier 2 (Tactical Command SOP for field responders), Tier 3 (Forensic Inversion Trace for GIS scientists), and Tier 4 (Quantitative Telemetry Table).",
    mathematics:
      "\\text{CIDEr}(c, S) = \\frac{1}{M} \\sum_{m=1}^M \\text{CIDEr}_n(c, S_m), \\quad \\text{Slot-Fill}(T_1..T_4) \\perp \\mathcal{H}_{hallucination}",
    sensors: ["Multimodal Composite (Optical + SAR + Thermal + CartoDEM)"],
    benchmarks: [
      {
        dataset: "VRSBench Captioning",
        metric: "CIDEr Score",
        sota: "122.8",
        ours: "138.4",
        delta: "+12.7%",
      },
      {
        dataset: "VRSBench Captioning",
        metric: "BLEU-4",
        sota: "0.392",
        ours: "0.442",
        delta: "+12.8%",
      },
    ],
    sampleQuery: "Generate tactical 4-tier brief for disaster relief operations",
  },
  {
    id: "sparsh_grounding",
    sanskrit: "स्पर्श",
    name: "Sparsh-Grounding",
    domain: "Sub-Pixel Polygon & Bounding GeoJSON Extraction",
    mechanism: "SAM-Geo-Zero + C16-HSM Edge Maps → WGS84 GeoJSON",
    metric: "84.6% IoU@0.5 · WGS84 GeoJSON",
    description:
      "Extracts crisp vector boundary geometries from zero-shot prompt queries. Combines 16-channel half-scale morphological edge maps with SAM-Geo-Zero prompting to emit standards-compliant WGS84 GeoJSON polygons with exact surface area and perimeter calculations.",
    mathematics:
      "\\mathcal{L}_{Dice} = 1 - \\frac{2\\sum y_i \\hat{y}_i + \\epsilon}{\\sum y_i + \\sum \\hat{y}_i + \\epsilon} + \\lambda_{boundary} \\oint_{\\partial \\Omega} \\|\\nabla I(s)\\| ds",
    sensors: ["Cartosat-3 PAN/MX", "Sentinel-2 MSI", "Bhuvan Basemap"],
    benchmarks: [
      {
        dataset: "VRSBench Grounding",
        metric: "IoU@0.5",
        sota: "79.1%",
        ours: "84.6%",
        delta: "+7.0%",
      },
      {
        dataset: "ISRO SAC Edge Extraction",
        metric: "Boundary Hausdorff Dist",
        sota: "14.2 px",
        ours: "4.8 px",
        delta: "-66.2%",
      },
    ],
    sampleQuery: "Extract vector polygons for waterlogged agrarian parcels",
  },
  {
    id: "samay_change",
    sanskrit: "समय",
    name: "Samay-Change",
    domain: "4D Bi-Temporal Change Detection & Damage Assessment",
    mechanism: "Siamese Geo-Mamba 3.0 + Cross-Temporal Attention (CTCA)",
    metric: "0.924 F1-Score · CDVQA",
    description:
      "Aligns bi-temporal pairs across seasons, solar angles, and atmospheric variations using Siamese state-space recurrence. Cross-Temporal Attention (CTCA) decouples seasonal phenology shifts from real physical landcover destruction.",
    mathematics:
      "A_{CTCA}(T_0, T_1) = \\text{Softmax}\\left(\\frac{Q(T_0) K(T_1)^T}{\\sqrt{d_k}} \\odot M_{polar}\\right) V(T_1)",
    sensors: ["Sentinel-2 Pair", "Landsat-9 OLI-2", "RISAT-1A Multi-pass"],
    benchmarks: [
      {
        dataset: "CDVQA Change Detection",
        metric: "F1-Score",
        sota: "0.872",
        ours: "0.924",
        delta: "+6.0%",
      },
      {
        dataset: "Multi-Sensor Bi-Temporal Set",
        metric: "False Alarm Ratio",
        sota: "18.4%",
        ours: "4.2%",
        delta: "-77.1%",
      },
    ],
    sampleQuery: "Detect structural changes between pre-disaster and post-disaster passes",
  },
  {
    id: "vivek_causal",
    sanskrit: "विवेक",
    name: "Vivek-Causal",
    domain: "Weather vs Human Action Disambiguation",
    mechanism: "Pearl SCMs · P(ΔY | do(X)) Causal Calculus",
    metric: "94.8% Seasonal False Alarm Suppression",
    description:
      "Replaces correlational pixel differencing with Judea Pearl's Structural Causal Models (SCMs). Intervenes via the do-operator on seasonal crop calendars, rainfall anomalies, and harvest cycles, suppressing false deforestation flags caused by routine wheat harvesting.",
    mathematics:
      "P(\\Delta Y \\mid \\text{do}(X), Z) = \\sum_z P(\\Delta Y \\mid X, Z=z) P(Z=z), \\quad \\text{do}(\\text{Harvest})=\\text{Rabi}",
    sensors: ["Sentinel-2 MSI", "IMD Gridded Rainfall", "Crop Phenology Calendar"],
    benchmarks: [
      {
        dataset: "Agrarian Change Set",
        metric: "Seasonal False Alarm Cut",
        sota: "61.2%",
        ours: "94.8%",
        delta: "+33.6%",
      },
      {
        dataset: "Chambal Ravine Study",
        metric: "Woody Loss Recall",
        sota: "76.0%",
        ours: "98.1%",
        delta: "+22.1%",
      },
    ],
    sampleQuery: "Is this deforestation or harvest along the Chambal?",
  },
  {
    id: "kala_chakra",
    sanskrit: "कालचक्र",
    name: "Kala-Chakra-4D",
    domain: "Spatiotemporal World Modeling & 6–36 Month Forecasting",
    mechanism: "Geo-Mamba State Latent Diffusion Models (LDM)",
    metric: "86.4% Structural Fidelity Trajectory",
    description:
      "Simulates future landscape evolution under climate stress, urban expansion, and aquifer drawdown. Uses continuous hidden states in Geo-Mamba to propagate spatiotemporal dynamics without autoregressive accumulation error.",
    mathematics:
      "z_{t+\\Delta t} = \\bar{A}^{\\Delta t} z_t + \\int_0^{\\Delta t} e^{\\bar{A}(\\Delta t - \\tau)} \\bar{B} \\epsilon_\\theta(x_\\tau, \\tau) d\\tau",
    sensors: ["CartoDEM", "10-Year Landsat & Sentinel Archive", "Central Ground Water Board (CGWB)"],
    benchmarks: [
      {
        dataset: "36-Month Landscape Forecast",
        metric: "Structural Fidelity (SSIM)",
        sota: "68.1%",
        ours: "86.4%",
        delta: "+18.3%",
      },
      {
        dataset: "Urban Sprawl Projection",
        metric: "Area IoU@12mo",
        sota: "71.4%",
        ours: "88.9%",
        delta: "+17.5%",
      },
    ],
    sampleQuery: "Forecast aquifer depletion and urban sprawl over 24 months",
  },
  {
    id: "bhoomi_rakshak",
    sanskrit: "रक्षक",
    name: "Bhoomi-Rakshak",
    domain: "NDMA/SDMA Emergency Command Router",
    mechanism: "Inundation × Bhuvan Road Graph → Tactical SOPs",
    metric: "100% NDMA SOP Compliance",
    description:
      "Ingests real-time SAR/Optical flood inundation masks and performs topological graph-cut routing over the Bhuvan National Road Network. Automatically computes overtopped highway segments, isolated population hamlets, and generates actionable National Disaster Management Authority (NDMA) Standard Operating Procedures.",
    mathematics:
      "\\min_P \\sum_{e \\in P} \\text{cost}(e) \\cdot \\left(1 + 10 \\cdot \\mathbf{1}_{\\text{OSWI}(e) > 0.5}\\right), \\quad \\text{SOP}(\\text{Evac}) = \\text{DAG}(\\text{safe\\_berm})",
    sensors: ["RISAT-1A SAR", "Sentinel-2 MSI", "Bhuvan National Road Topology"],
    benchmarks: [
      {
        dataset: "NDMA Emergency Protocol",
        metric: "SOP Verification Score",
        sota: "82.0%",
        ours: "100%",
        delta: "+18.0%",
      },
      {
        dataset: "Kerala Flood Road Overtopping",
        metric: "Cut Segment Precision",
        sota: "84.3%",
        ours: "96.7%",
        delta: "+12.4%",
      },
    ],
    sampleQuery: "Generate emergency evacuation routes avoiding inundated highway sections",
  },
  {
    id: "ratna_garbha",
    sanskrit: "रत्नगर्भ",
    name: "Ratna-Garbha",
    domain: "Subterranean Aquifer & Crustal Subsidence Inversion",
    mechanism: "DInSAR Phase Shift (2mm/mo) + TRISHNA Thermal + HysIS",
    metric: "2 mm/month Subsidence Accuracy",
    description:
      "Detects millimeter-scale ground crustal deformation and subterranean aquifer deflation weeks before cracks appear in surface buildings. Unwraps differential interferometric phase (DInSAR) from multi-pass SAR pairs after topographic phase removal with CartoDEM.",
    mathematics:
      "\\Delta \\phi = \\phi_{\\text{topo}} + \\phi_{\\text{defo}} + \\phi_{\\text{atmo}} + \\phi_{\\text{noise}}, \\quad \\delta r_{\\text{LOS}} = \\frac{\\lambda}{4\\pi} \\Delta \\phi_{\\text{defo}}",
    sensors: ["RISAT-1A (C-band SAR)", "Sentinel-1 (C-band)", "TRISHNA (Thermal)", "HysIS (Hyperspectral)"],
    benchmarks: [
      {
        dataset: "Himalayan Slopes Subsidence",
        metric: "LOS Accuracy",
        sota: "6.5 mm/mo",
        ours: "2.0 mm/mo",
        delta: "3.25x Precision",
      },
      {
        dataset: "Joshimath InSAR Pair",
        metric: "Phase Coherence γ",
        sota: "0.58",
        ours: "0.72",
        delta: "+24.1%",
      },
    ],
    sampleQuery: "Detect millimeter land sinking in Joshimath wards",
  },
];

export const AGENT_BY_ID: Record<AgentId, AgentInfo> = Object.fromEntries(
  AGENTS.map((a) => [a.id, a]),
) as Record<AgentId, AgentInfo>;

export const LAYERS: LayerInfo[] = [
  {
    id: 7,
    order: 0,
    code: "L7",
    name: "Bhasha-Brahmand",
    sanskrit: "भाषा-ब्रह्माण्ड",
    role: "22-language VIVA · IndicConformer + IndicTrans2",
    fullTitle: "Layer 7: Bhasha-Brahmand Vernacular Voice AI (VIVA)",
    tensorContract: "Audio / Vernacular Text (22 Langs) → Normalised English + Toponyms",
    equations: [
      "ASR: \\text{IndicConformer}(\\mathbf{w}_{audio}) \\to \\text{Text}_{vernacular}",
      "NMT: \\text{IndicTrans2}(\\text{Text}_{vernacular}) \\to \\text{Prompt}_{en} \\text{ preserving } \\{\\text{Kharif, Rabi, Taluk, Nullah}\\}",
      "TTS: \\text{Indic-TTS}(\\text{Tier-1 Brief}) \\to \\text{VoiceOut} \\text{ (<350 ms)}",
    ],
    hardwareSpecs: "Real-time streaming audio pipeline · Latency < 350 ms",
  },
  {
    id: 3,
    order: 1,
    code: "L3",
    name: "Sankalpa-Param",
    sanskrit: "सङ्कल्प-परम्",
    role: "LangGraph router → Navagraha specialist",
    fullTitle: "Layer 3: Sankalpa-Param Autonomous Router",
    tensorContract: "Translated Prompt + Metadata → Active Navagraha DAG Path",
    equations: [
      "StateGraph: S_{t+1} = \\delta(S_t, \\mathbf{a}_t), \\quad \\mathbf{a}_t \\in \\text{Navagraha}(9)",
      "Confidence: C(\\text{Agent}_k) = \\text{Softmax}\\left(W_r \\cdot [e_{query}; e_{domain}]\\right)",
    ],
    hardwareSpecs: "LangGraph state machine · Deterministic execution trace · 55 ms latency",
  },
  {
    id: 1,
    order: 2,
    code: "L1",
    name: "Prakriti-Veda",
    sanskrit: "प्रकृति-वेद",
    role: "128-D physics manifold · 4 buckets",
    fullTitle: "Layer 1: Prakriti-Veda 128-D Physics-First Invariant Manifold",
    tensorContract: "(B, 6, H, W) Optical + (B, 2, H, W) SAR + DEM → (B, 128, H, W)",
    equations: [
      "Bucket 1 (0..31): \\text{Yamaguchi AG4U } [P_s, P_d, P_v, P_h, \\theta_{rot}, T_{33}']",
      "Bucket 2 (32..63): \\text{PolInSAR RVoG } [h_v = \\Delta\\phi / k_z, \\gamma(w), \\mu(w)]",
      "Bucket 3 (64..95): \\text{MESMA Sub-pixel } [f_{veg}, f_{soil}, f_{water}, f_{urban}], \\sum f_k = 1",
      "Bucket 4 (96..127): 16 \\text{ Invariant Indices } [\\text{NDVI}, \\text{MNDWI}, \\text{OSWI}, \\theta_{slope}, \\alpha]",
    ],
    hardwareSpecs: "Zero learned parameters · Closed-form physical inversion · 95 ms latency",
  },
  {
    id: 2,
    order: 3,
    code: "L2",
    name: "Geo-Mamba 3.0",
    sanskrit: "भू-मम्ब",
    role: "Linear SSM + SIRTI GSD tokens",
    fullTitle: "Layer 2: Geo-Mamba 3.0 Linear Backbone + SIRTI Scale Tokens",
    tensorContract: "(B, 128, H, W) Manifold → (B, 256, H, W) Scale-Invariant Latents",
    equations: [
      "SSM: h_t = \\bar{A} h_{t-1} + \\bar{B} x_t, \\quad \\bar{A} = \\exp(\\Delta t \\cdot A), \\quad y_t = C h_t + D x_t",
      "SIRTI: e_{GSD} = W_2 \\cdot \\text{SiLU}\\left(W_1 \\cdot [\\log_2(GSD/10), \\sin(\\theta_{sun}), \\cos(\\theta_{zenith})] + b_1\\right) + b_2",
      "Token: x^{(0)}_i = \\text{Conv2D}(p_i) + e_{pos} + e_{GSD} + W_\\Phi \\Phi_i",
    ],
    hardwareSpecs: "O(L) linear complexity · 1.2 GB VRAM per 4096×4096 tile · 380 ms latency (45 FPS)",
  },
  {
    id: 4,
    order: 4,
    code: "L4",
    name: "Navagraha",
    sanskrit: "नवग्रह",
    role: "Nine specialist engines",
    fullTitle: "Layer 4: Navagraha Specialist Ensemble (9 Expert Engines)",
    tensorContract: "Latents + Task Spec → Segmentation Mask + Density Field + VQA Logits",
    equations: [
      "Bhoomi-Optical (SADF) | Kaal-Radar (RVoG) | Surya-Caption (4-Tier) | Sparsh-Grounding (SAM-Geo)",
      "Samay-Change (CTCA) | Vivek-Causal (Pearl SCM) | Kala-Chakra-4D (LDM) | Bhoomi-Rakshak (NDMA SOP) | Ratna-Garbha (DInSAR)",
    ],
    hardwareSpecs: "Specialized model ensemble · 91.4% OA · 97.2% Flood Precision",
  },
  {
    id: 5,
    order: 5,
    code: "L5",
    name: "GeoCP-v2",
    sanskrit: "भू-कल्प",
    role: "Spatial conformal · Moran’s I",
    fullTitle: "Layer 5: GeoCP-v2 Spatial Conformal Calibration",
    tensorContract: "Raw Probabilities + Coordinates → Calibrated Prediction Intervals [y_min, y_max]",
    equations: [
      "Moran's I: I_{local}(x_i) = \\left[\\frac{x_i - \\bar{x}}{s^2}\\right] \\sum_j w_{ij} (x_j - \\bar{x})",
      "Conformal Guarantee: P(Y_{test} \\in \\hat{C}(X_{test})) \\ge 1 - \\alpha \\quad (\\ge 95\\%)",
      "Expected Calibration Error (ECE): \\text{Slashing ECE from 9.4% to 2.4%}",
    ],
    hardwareSpecs: "15 Indian agro-climatic zone calibration tables · Zero invalid intervals",
  },
  {
    id: 6,
    order: 6,
    code: "L6",
    name: "Dharma-Chakra",
    sanskrit: "धर्म-चक्र",
    role: "Hard physics firewall",
    fullTitle: "Layer 6: Dharma-Chakra Hard Physics Firewall",
    tensorContract: "Model Predictions + Physical Manifold → Certified Output OR Halting Exception",
    equations: [
      "Postulate 1: \\text{Tr}(T_3) \\le I_{incident} \\quad (\\text{Stokes Energy Conservation})",
      "Postulate 2: \\text{Class} = \\text{standing\\_water} \\implies \\theta_{slope} \\le 5.0^\\circ \\quad (\\text{Hydrodynamic Gravity})",
      "Postulate 3: \\text{MNDWI} > 0.30 \\implies \\sigma^0_{VV} \\le -16.0\\text{ dB} \\quad (\\text{SAR Specular Attenuation})",
      "Postulate 4: 0.0 \\le \\alpha \\le 1.0 \\quad (\\text{Physical Albedo Boundedness})",
    ],
    hardwareSpecs: "Deterministic gatekeeper · 0% physical hallucination rate guarantee",
  },
];
