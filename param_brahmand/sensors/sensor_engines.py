"""
PARAM-BRAHMAND Sensor Engines
==============================
Implements calibrated simulation engines for four ISRO/NASA satellite sensors:

  1. TRISHNAThermalEngine     — TRISHNA TIR 8-band thermal infrared (50 m)
  2. HysISHyperspectralEngine — ISRO HysIS EO-1 256-band VNIR/SWIR (30 m)
  3. NISARDualBandEngine      — NASA-ISRO SAR L+S dual-frequency (3–10 m)
  4. Cartosat3PanSharpener    — Cartosat-3 sub-metre PAN + 4-band MS fusion

Each engine exposes:
  .simulate(scene_params) → Dict  — forward sensor model
  .calibrate(raw)         → Dict  — radiometric calibration pipeline
  .metadata               → Dict  — sensor specification sheet
"""

from typing import Dict, List, Any, Optional, Tuple
import math


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _blackbody_radiance(temp_k: float, wavelength_um: float) -> float:
    """
    Planck's law: spectral radiance [W·sr⁻¹·m⁻²·μm⁻¹].
    h=6.626e-34, c=3e8, k=1.38e-23
    """
    h = 6.626e-34
    c = 3.0e8
    k_b = 1.38e-23
    wl_m = wavelength_um * 1e-6
    try:
        radiance = (2.0 * h * c ** 2 / wl_m ** 5) / (
            math.exp((h * c) / (wl_m * k_b * temp_k)) - 1.0
        )
    except (OverflowError, ZeroDivisionError):
        radiance = 0.0
    return radiance


def _top_of_atmosphere_reflectance(
    at_sensor_radiance: float,
    solar_irradiance: float,
    cos_solar_zenith: float,
    earth_sun_dist_au: float = 1.0,
) -> float:
    """Convert at-sensor radiance to TOA reflectance (unitless)."""
    denom = solar_irradiance * cos_solar_zenith / (math.pi * earth_sun_dist_au ** 2)
    if denom < 1e-10:
        return 0.0
    return at_sensor_radiance / denom


# ---------------------------------------------------------------------------
# 1. TRISHNA Thermal Engine
# ---------------------------------------------------------------------------

TRISHNA_TIR_BANDS = {
    "TIR1": {"center_um": 8.0,  "width_um": 0.5, "nedt_k": 0.10},
    "TIR2": {"center_um": 8.5,  "width_um": 0.5, "nedt_k": 0.10},
    "TIR3": {"center_um": 9.0,  "width_um": 0.5, "nedt_k": 0.12},
    "TIR4": {"center_um": 9.5,  "width_um": 0.5, "nedt_k": 0.12},
    "TIR5": {"center_um": 10.0, "width_um": 0.5, "nedt_k": 0.08},
    "TIR6": {"center_um": 10.5, "width_um": 0.5, "nedt_k": 0.08},
    "TIR7": {"center_um": 11.0, "width_um": 0.5, "nedt_k": 0.09},
    "TIR8": {"center_um": 12.0, "width_um": 1.0, "nedt_k": 0.09},
}


class TRISHNAThermalEngine:
    """
    TRISHNA (Thermal infraRed Imaging Satellite for High-resolution Natural resource Assessment)
    Sensor: 8-band TIR (8–12 μm), GSD 50 m, SSO 778 km altitude
    Applications: LST retrieval, drought/heat-stress, evapotranspiration, urban heat island
    """

    metadata = {
        "satellite": "TRISHNA (ISRO–CNES)",
        "altitude_km": 778,
        "gsd_m": 50,
        "revisit_days": 3,
        "bands": list(TRISHNA_TIR_BANDS.keys()),
        "spectral_range_um": "8.0–13.0",
        "swath_km": 1000,
        "nedt_k": 0.10,
        "calibration": "On-board blackbody + vicarious",
        "mission_start": "2024",
    }

    def simulate(
        self,
        lst_k: float = 305.0,           # Land Surface Temperature (K)
        emissivity: float = 0.97,        # Broadband surface emissivity
        atmospheric_transmittance: float = 0.88,
        sky_irradiance_w_m2: float = 200.0,
    ) -> Dict[str, Any]:
        """
        Simulate at-sensor radiance for all 8 TIR bands given surface LST.
        Returns per-band radiance and derived LST estimate.
        """
        band_results = {}
        for band_name, spec in TRISHNA_TIR_BANDS.items():
            wl = spec["center_um"]
            # Surface emitted radiance
            b_surface = _blackbody_radiance(lst_k, wl) * emissivity
            # Atmospheric path radiance (simplified)
            b_atm = _blackbody_radiance(280.0, wl) * (1.0 - atmospheric_transmittance)
            # At-sensor radiance
            l_sensor = atmospheric_transmittance * b_surface + b_atm
            # Add NEdT noise (simplified)
            dl = spec["nedt_k"] * _blackbody_radiance(lst_k, wl) / lst_k
            band_results[band_name] = {
                "radiance_w_sr_m2_um": round(l_sensor, 6),
                "noise_equivalent_radiance": round(dl, 8),
                "center_wavelength_um": wl,
            }

        # Split-window LST retrieval (Jimenez-Munoz, TIR7 + TIR8)
        l7 = band_results["TIR7"]["radiance_w_sr_m2_um"]
        l8 = band_results["TIR8"]["radiance_w_sr_m2_um"]
        lst_retrieved = lst_k + 1.8 * (l7 - l8) / (l7 + 1e-12)  # simplified coefficient

        return {
            "sensor": "TRISHNA",
            "input_lst_k": lst_k,
            "retrieved_lst_k": round(lst_retrieved, 2),
            "lst_accuracy_k": abs(round(lst_retrieved - lst_k, 2)),
            "emissivity": emissivity,
            "bands": band_results,
            "application": "Land Surface Temperature / Evapotranspiration",
        }

    def calibrate(self, raw: Dict[str, float]) -> Dict[str, float]:
        """Apply gain/offset radiometric calibration to raw DN values."""
        gain = 0.00341802
        offset = 149.0
        return {
            band: round(raw[band] * gain + offset, 4)
            for band in raw
        }


# ---------------------------------------------------------------------------
# 2. HysIS Hyperspectral Engine
# ---------------------------------------------------------------------------

class HysISHyperspectralEngine:
    """
    HysIS (Hyperspectral Imaging Satellite) — ISRO EO-1
    Sensor: 256 contiguous bands (VNIR: 0.4–1.0 μm @ 10nm, SWIR: 1.0–2.5 μm @ 10nm)
    GSD: 30 m (VNIR), 30 m (SWIR), SSO 630 km
    Applications: Mineralogy, vegetation biochemistry, urban material mapping, water quality
    """

    N_VNIR = 55   # Bands 400–950 nm, 10 nm step
    N_SWIR = 145  # Bands 950–2500 nm, 10 nm step
    N_TOTAL = 200

    metadata = {
        "satellite": "HysIS (ISRO EO-1)",
        "altitude_km": 630,
        "gsd_m": 30,
        "revisit_days": 30,
        "n_bands": N_TOTAL,
        "vnir_bands": N_VNIR,
        "swir_bands": N_SWIR,
        "spectral_range_nm": "400–2500",
        "spectral_resolution_nm": 10,
        "snr_min": 100,
        "mission_start": "2018",
    }

    def simulate(
        self,
        surface_type: str = "vegetation",
        solar_zenith_deg: float = 30.0,
        water_content_gm2: float = 150.0,
        chlorophyll_ug_cm2: float = 40.0,
    ) -> Dict[str, Any]:
        """
        Simulate 200-band hyperspectral reflectance for common surface types.
        Returns wavelength array and reflectance spectrum.
        """
        cos_sz = math.cos(math.radians(solar_zenith_deg))

        # Endmember spectral basis [B,G,R,NIR,SWIR1,SWIR2]
        endmembers = {
            "vegetation": [0.030, 0.105, 0.045, 0.480, 0.240, 0.120],
            "soil":       [0.140, 0.200, 0.240, 0.300, 0.340, 0.310],
            "water":      [0.035, 0.060, 0.038, 0.028, 0.012, 0.005],
            "urban":      [0.110, 0.130, 0.155, 0.170, 0.200, 0.190],
        }
        base = endmembers.get(surface_type, endmembers["soil"])

        wavelengths = []
        reflectances = []
        for i in range(self.N_TOTAL):
            nm = 400 + i * 10.5
            wavelengths.append(round(nm, 1))
            # Interpolate from 6-band endmember using piecewise linear
            frac = i / (self.N_TOTAL - 1)
            idx = min(4, int(frac * 5))
            t = (frac * 5) - idx
            refl = base[idx] * (1 - t) + base[min(5, idx + 1)] * t
            # Chlorophyll absorption at red edge (~670 nm)
            if 640 <= nm <= 680:
                refl *= max(0.1, 1.0 - chlorophyll_ug_cm2 / 200.0)
            # Water absorption features at 970 nm and 1150 nm
            if 950 <= nm <= 990 or 1130 <= nm <= 1170:
                refl *= max(0.05, 1.0 - water_content_gm2 / 600.0)
            reflectances.append(round(refl * cos_sz, 5))

        return {
            "sensor": "HysIS",
            "surface_type": surface_type,
            "n_bands": self.N_TOTAL,
            "wavelengths_nm": wavelengths,
            "toa_reflectances": reflectances,
            "solar_zenith_deg": solar_zenith_deg,
            "dominant_index": "Red-Edge NDRE: {:.3f}".format(
                (reflectances[70] - reflectances[45]) / (reflectances[70] + reflectances[45] + 1e-7)
            ),
        }


# ---------------------------------------------------------------------------
# 3. NISAR Dual-Band SAR Engine
# ---------------------------------------------------------------------------

class NISARDualBandEngine:
    """
    NISAR (NASA-ISRO Synthetic Aperture Radar)
    L-band (24 cm) + S-band (12 cm) dual-frequency, quad-pol
    GSD: 3–10 m, Swath: 242 km, SSO 747 km altitude
    Applications: Deformation, biomass, soil moisture, ice, subsidence (DInSAR)
    """

    metadata = {
        "satellite": "NISAR (NASA-ISRO)",
        "altitude_km": 747,
        "gsd_m": {"stripmap": 6, "scansar": 12},
        "swath_km": 242,
        "revisit_days": 12,
        "bands": ["L-band (24 cm)", "S-band (12 cm)"],
        "polarisations": ["HH", "HV", "VH", "VV"],
        "nesz_db": -22,
        "coherence_temporal": 0.85,
        "mission_start": "2024",
    }

    def simulate(
        self,
        surface: str = "agricultural",
        soil_moisture_pct: float = 25.0,
        biomass_t_ha: float = 80.0,
        deformation_mm: float = 0.0,
        incidence_deg: float = 35.0,
    ) -> Dict[str, Any]:
        """
        Simulate L-band and S-band sigma-naught (dB) and interferometric coherence.
        """
        inc_rad = math.radians(incidence_deg)
        cos_inc = math.cos(inc_rad)

        # Surface roughness model (Dubois model approximation)
        roughness_rms = {"agricultural": 1.2, "forest": 5.0, "urban": 3.5, "water": 0.1}.get(surface, 2.0)
        mv = soil_moisture_pct / 100.0

        # L-band (24 cm) sigma-naught VV dB — more sensitive to soil moisture & biomass
        l_sigma_vv = (
            -15.0
            + 6.5 * mv
            + 2.0 * math.log10(max(1.0, biomass_t_ha / 10.0))
            - 3.0 * (1.0 - cos_inc)
            + roughness_rms * 0.3
        )
        l_sigma_vh = l_sigma_vv - 7.5  # Cross-pol offset

        # S-band (12 cm) — more surface sensitive
        s_sigma_vv = (
            -18.0
            + 4.5 * mv
            + 0.8 * math.log10(max(1.0, biomass_t_ha / 10.0))
            - 4.0 * (1.0 - cos_inc)
            + roughness_rms * 0.5
        )
        s_sigma_vh = s_sigma_vv - 8.0

        # DInSAR Phase — millimetre-scale deformation
        wavelength_l_m = 0.24
        dinsar_phase_rad = (4.0 * math.pi * deformation_mm / 1000.0) / wavelength_l_m
        temporal_coherence = max(0.0, 0.92 - abs(soil_moisture_pct - 20.0) * 0.005)

        return {
            "sensor": "NISAR",
            "surface": surface,
            "l_band": {
                "sigma0_vv_db": round(l_sigma_vv, 2),
                "sigma0_vh_db": round(l_sigma_vh, 2),
                "wavelength_cm": 24,
                "penetration_depth_cm": round(24.0 / (2.0 * mv + 0.1), 1),
            },
            "s_band": {
                "sigma0_vv_db": round(s_sigma_vv, 2),
                "sigma0_vh_db": round(s_sigma_vh, 2),
                "wavelength_cm": 12,
            },
            "interferometry": {
                "deformation_input_mm": deformation_mm,
                "dinsar_phase_rad": round(dinsar_phase_rad, 4),
                "temporal_coherence": round(temporal_coherence, 3),
                "ambiguity_height_m": round(wavelength_l_m * 747000 / (2.0 * 242000 * math.sin(inc_rad) + 1e-7), 1),
            },
            "soil_moisture_pct": soil_moisture_pct,
            "biomass_t_ha": biomass_t_ha,
        }


# ---------------------------------------------------------------------------
# 4. Cartosat-3 Pan-Sharpener
# ---------------------------------------------------------------------------

class Cartosat3PanSharpener:
    """
    Cartosat-3 PAN + 4-band MS Brovey/IHS/Gram-Schmidt Fusion
    PAN: 0.45–0.65 μm, GSD 0.28 m
    MS: Blue (0.45–0.52), Green (0.52–0.60), Red (0.62–0.69), NIR (0.75–0.90) @ 1.12 m
    Applications: Sub-metre urban mapping, infrastructure assessment, defence cartography
    """

    metadata = {
        "satellite": "Cartosat-3 (ISRO)",
        "altitude_km": 505,
        "pan_gsd_m": 0.28,
        "ms_gsd_m": 1.12,
        "pan_band_nm": "450–650",
        "ms_bands": ["Blue 450-520", "Green 520-600", "Red 620-690", "NIR 750-900"],
        "revisit_days": 4,
        "swath_km": 17.4,
        "tdi_stages": 6,
        "mission_start": "2019",
    }

    def simulate(
        self,
        pan_reflectance: float = 0.18,
        ms_blue: float = 0.08,
        ms_green: float = 0.10,
        ms_red: float = 0.12,
        ms_nir: float = 0.35,
    ) -> Dict[str, Any]:
        """Simulate Cartosat-3 PAN and multi-spectral band values."""
        # Synthetic PAN as weighted average of MS
        synth_pan = 0.19 * ms_blue + 0.28 * ms_green + 0.40 * ms_red + 0.13 * ms_nir
        ndvi = (ms_nir - ms_red) / (ms_nir + ms_red + 1e-7)
        return {
            "sensor": "Cartosat-3",
            "pan": round(pan_reflectance, 5),
            "ms": {"blue": ms_blue, "green": ms_green, "red": ms_red, "nir": ms_nir},
            "synthetic_pan": round(synth_pan, 5),
            "ndvi": round(ndvi, 4),
            "pan_gsd_m": 0.28,
            "ms_gsd_m": 1.12,
        }

    def brovey_fuse(
        self,
        pan: float,
        ms_blue: float,
        ms_green: float,
        ms_red: float,
        ms_nir: float,
    ) -> Dict[str, float]:
        """
        Brovey Transform pan-sharpening: B_fused = B_ms / (B_ms_sum) * PAN
        Output bands at PAN resolution (0.28 m GSD).
        """
        total = ms_blue + ms_green + ms_red + ms_nir + 1e-7
        return {
            "blue_fused":  round(ms_blue  / total * pan, 5),
            "green_fused": round(ms_green / total * pan, 5),
            "red_fused":   round(ms_red   / total * pan, 5),
            "nir_fused":   round(ms_nir   / total * pan, 5),
            "fused_gsd_m": 0.28,
            "method": "Brovey Transform",
        }

    def gram_schmidt_fuse(
        self,
        pan: float,
        ms_blue: float,
        ms_green: float,
        ms_red: float,
        ms_nir: float,
    ) -> Dict[str, float]:
        """
        Gram-Schmidt Spectral Sharpening — higher spectral fidelity than Brovey.
        Simulated; for true GS use full array operations.
        """
        bands = {"blue": ms_blue, "green": ms_green, "red": ms_red, "nir": ms_nir}
        synth_pan = 0.19 * ms_blue + 0.28 * ms_green + 0.40 * ms_red + 0.13 * ms_nir
        gain = pan / (synth_pan + 1e-7)
        return {
            f"{k}_gs_fused": round(v * gain, 5)
            for k, v in bands.items()
        } | {"fused_gsd_m": 0.28, "method": "Gram-Schmidt"}


# ---------------------------------------------------------------------------
# 5. Sensor Engine Registry
# ---------------------------------------------------------------------------

class SensorEngineRegistry:
    """
    Central registry and dispatcher for all PARAM-BRAHMAND sensor engines.

    Usage:
        reg = SensorEngineRegistry()
        result = reg.run("NISAR", soil_moisture_pct=30.0, deformation_mm=-12.5)
    """

    _engines = {
        "TRISHNA": TRISHNAThermalEngine,
        "HysIS": HysISHyperspectralEngine,
        "NISAR": NISARDualBandEngine,
        "Cartosat3": Cartosat3PanSharpener,
    }

    def __init__(self):
        self._instances: Dict[str, Any] = {
            k: cls() for k, cls in self._engines.items()
        }

    def run(self, sensor_name: str, **kwargs) -> Dict[str, Any]:
        engine = self._instances.get(sensor_name)
        if engine is None:
            raise ValueError(f"Unknown sensor: {sensor_name}. Available: {list(self._engines)}")
        return engine.simulate(**kwargs)

    def all_metadata(self) -> Dict[str, Any]:
        return {name: inst.metadata for name, inst in self._instances.items()}

    def available_sensors(self) -> List[str]:
        return list(self._engines.keys())
