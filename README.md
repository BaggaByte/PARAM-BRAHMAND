# PARAM-BRAHMAND (परम-ब्रह्माण्ड) / VISHWAROOPA-AI

> **Physics-First 7-Layer Multimodal Earth Intelligence Operating System**  
> Developed for **ISRO Space Applications Centre (SAC), Ahmedabad — PS 26167 (SatQuery AI)**  
> **Team:** TensorTitans | Smart India Hackathon 2026

---

## 🛰️ Overview

**PARAM-BRAHMAND** is an interactive vision-language geospatial intelligence platform designed to analyze multimodal remote sensing telemetry (Optical, SAR, Thermal, Hyperspectral, and DEM) through natural language text and 22-language vernacular voice queries.

It replaces black-box deep learning hallucinations with:
* **128-D Invariant Physics Manifold (Prakriti-Veda):** Yamaguchi AG4U Polarimetric SAR decomposition, PolInSAR RVoG 3D canopy height inversion, MESMA sub-pixel spectral mixture analysis, and 16 invariant indices.
* **Geo-Mamba 3.0 Linear Backbone:** $\mathcal{O}(L)$ linear complexity spatial state-space modeling with SIRTI scale-invariant representations.
* **Navagraha Specialist Ensemble:** 9 domain-expert agents (Bhoomi-Optical, Kaal-Radar, Surya-Caption, Sparsh-Grounding, Samay-Change, Vivek-Causal, Kala-Chakra-4D, Bhoomi-Rakshak, Ratna-Garbha).
* **GeoCP-v2 Spatial Conformal Calibration:** Moran's I spatially adaptive prediction sets with guaranteed coverage error bounds.
* **Dharma-Chakra Hard Physics Firewall:** Deterministic physical conservation checks enforcing Stokes energy conservation, hydrodynamic slope consistency, and albedo conservation.
* **Bhasha-Brahmand Vernacular Interface:** Natural voice and text interaction across 22 scheduled Indian languages (AI4Bharat IndicConformer / IndicTrans2).

---

## 🏛️ 7-Layer Architecture

```text
[ User Query (Text / 22 Indian Voice Languages) ]
                      │
                      ▼
┌──────────────────────────────────────────────────────────┐
│ Layer 7: Bhasha-Brahmand (AI4Bharat Vernacular VIVA)      │
└─────────────────────────┬────────────────────────────────┘
                          │ (Translated Prompt + Target Metadata)
                          ▼
┌──────────────────────────────────────────────────────────┐
│ Layer 3: Sankalpa-Param Autonomous Router (LangGraph)    │
└─────────────────────────┬────────────────────────────────┘
                          │ (Routes Task to Specialized Agent)
                          ▼
┌──────────────────────────────────────────────────────────┐
│ Layer 1: Prakriti-Veda 128-D Physics-First Manifold      │
│  - Bucket 1: Yamaguchi AG4U Polarimetric SAR             │
│  - Bucket 2: PolInSAR RVoG 3D Canopy Height Inversion    │
│  - Bucket 3: MESMA Sub-Pixel Spectral Mixture Analysis   │
│  - Bucket 4: 16 Invariant Optical & SAR Spectral Indices │
└─────────────────────────┬────────────────────────────────┘
                          │ (128-Channel Invariant Tensor)
                          ▼
┌──────────────────────────────────────────────────────────┐
│ Layer 2: Geo-Mamba 3.0 Linear Backbone + SIRTI Scale    │
└─────────────────────────┬────────────────────────────────┘
                          │ (O(L) Latent Representations)
                          ▼
┌──────────────────────────────────────────────────────────┐
│ Layer 4: Navagraha Specialist Ensemble (9 Expert Agents) │
│  (Bhoomi-Optical, Kaal-Radar, Surya-Caption, etc.)      │
└─────────────────────────┬────────────────────────────────┘
                          │ (Raw Agent Output & Bounding Mask)
                          ▼
┌──────────────────────────────────────────────────────────┐
│ Layer 5: GeoCP-v2 Spatial Conformal Calibration         │
└─────────────────────────┬────────────────────────────────┘
                          │ (Moran's I Uncertainty Quantified)
                          ▼
┌──────────────────────────────────────────────────────────┐
│ Layer 6: Dharma-Chakra Hard Physics Firewall             │
│  (Enforces Stokes Energy, Hydrodynamic Slope, Albedo)   │
└─────────────────────────┬────────────────────────────────┘
                          │ (0% Physical Hallucination Output)
                          ▼
[ Final Output: VQA Answer, GeoJSON Polygon, 4-Tier Brief ]
```

---

## 🚀 Live SIH Pitch Case Studies

1. **Kaziranga National Park, Assam (`KS-FL-07`):** Sub-canopy monsoon flood mapping under 100% cloud cover via PolInSAR RVoG & $P_d$ double-bounce radar decomposition.
2. **Joshimath, Uttarakhand (`JH-DN-02`):** Millimeter-precision crustal subsidence tracking ($2\text{ mm/mo}$) using DInSAR interferometric phase shifts.
3. **Chambal River Basin, MP/Raj (`CB-CA-11`):** Structural causal disambiguation (Pearl SCMs) distinguishing agricultural crop harvesting from illegal deforestation (94.8% false-alarm reduction).
4. **Kuttanad, Kerala (`KL-HW-04`):** Below-sea-level highway inundation mapping with NDMA SOP emergency routing.

---

## 🛠️ Technology Stack

* **Frontend:** React 19, TypeScript, TanStack Start/Router, Tailwind CSS v4, Radix UI, Leaflet / React-Leaflet, Lucide Icons, Recharts, Zustand
* **Physics & Remote Sensing:** 128-D Invariant Tensor Manifold, PolInSAR RVoG, Yamaguchi 4-Component Decomposition, MESMA, Moran's I spatial autocorrelation
* **Intelligence Layer:** Geo-Mamba 3.0 Linear SSMs, Pearl Causal SCMs, Navagraha 9-Agent Ensemble, AI4Bharat 22-language vernacular NLP

---

## ⚡ Quickstart

### Prerequisites
- Node.js >= 22.x
- npm >= 10.x

### Installation & Run

```bash
# Clone the repository
git clone https://github.com/BaggaByte/PARAM-BRAHMAND.git
cd PARAM-BRAHMAND

# Install dependencies
npm install

# Start development console
npm run dev
```

Open `http://localhost:8080` in your browser.

---

## 📄 License

Developed for ISRO SAC SIH 2026. All rights reserved.
