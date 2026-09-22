"""
Unit tests for Layer 1: Prakriti-Veda 128-D Physics-First Manifold.
"""

from param_brahmand.physics.prakriti_veda import PrakritiVedaManifold

def test_manifold_128_channels():
    builder = PrakritiVedaManifold()
    result = builder.build_128d_manifold(
        optical_bands=[0.04, 0.06, 0.04, 0.45, 0.18, 0.08],
        sigma0_vv_db=-14.5,
        sigma0_vh_db=-22.0,
        dem_slope_deg=2.1,
        canopy_height_m=12.0
    )

    assert result["total_channels"] == 128
    assert len(result["manifold_vector"]) == 128
    assert "bucket1_ag4u" in result["buckets"]
    assert "bucket2_rvog" in result["buckets"]
    assert "bucket3_mesma" in result["buckets"]
    assert "bucket4_indices" in result["buckets"]

def test_yamaguchi_ag4u_powers():
    ag4u = PrakritiVedaManifold.compute_yamaguchi_ag4u(
        sigma0_vv_db=-12.0,
        sigma0_vh_db=-18.0
    )
    assert ag4u["span"] > 0
    assert ag4u["ps"] >= 0
    assert ag4u["pd"] >= 0
    assert ag4u["pv"] >= 0
    assert -22.5 <= ag4u["theta_rot_deg"] <= 22.5

def test_mesma_unmixing_sum_to_one():
    mesma = PrakritiVedaManifold.compute_mesma([0.03, 0.05, 0.04, 0.48, 0.18, 0.08])
    total = mesma["veg"] + mesma["soil"] + mesma["water"] + mesma["urban"]
    assert abs(total - 1.0) < 1e-3
    assert mesma["veg"] > 0.40  # Dominant vegetation signature

def test_oswi_inundation_index():
    # Water with high MNDWI and low sigma0_vv_db should yield high OSWI close to 1.0
    indices = PrakritiVedaManifold.compute_spectral_indices(
        blue=0.04, green=0.07, red=0.03, nir=0.03, swir1=0.015, swir2=0.01,
        sigma0_vv_db=-18.0, dem_slope_deg=1.2
    )
    assert indices["oswi"] > 0.70
