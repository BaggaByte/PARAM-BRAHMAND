"""
Unit tests for Layer 6: Dharma-Chakra Hard Physics Firewall.
"""

from param_brahmand.physics.dharma_chakra import DharmaChakraFirewall

def test_firewall_all_pass():
    firewall = DharmaChakraFirewall()
    res = firewall.validate_prediction(
        predicted_class="standing_water",
        dem_slope_deg=1.5,
        optical_mndwi=0.45,
        sar_sigma0_vv_db=-18.0,
        albedo=0.08,
        trace_t3=0.75,
        i_incident=1.00
    )
    assert res["passed"] is True
    assert res["status"] == "PASSED"

def test_firewall_rejects_hydrodynamic_slope_violation():
    firewall = DharmaChakraFirewall()
    # Standing water predicted on steep 12.5 deg slope
    res = firewall.validate_prediction(
        predicted_class="standing_water",
        dem_slope_deg=12.5,
        optical_mndwi=0.45,
        sar_sigma0_vv_db=-18.0,
        albedo=0.08,
        trace_t3=0.75,
        i_incident=1.00
    )
    assert res["passed"] is False
    assert res["status"] == "REJECTED"
    assert "Hydrodynamic Slope Limit" in res["rejection_reason"]

def test_firewall_rejects_stokes_energy_violation():
    firewall = DharmaChakraFirewall()
    # Reflected radiance (1.45) exceeds incident flux (1.00)
    res = firewall.validate_prediction(
        predicted_class="vegetation",
        dem_slope_deg=1.5,
        optical_mndwi=0.05,
        sar_sigma0_vv_db=-10.0,
        albedo=0.25,
        trace_t3=1.45,
        i_incident=1.00
    )
    assert res["passed"] is False
    assert "Stokes Energy Conservation" in res["rejection_reason"]

def test_firewall_rejects_albedo_bound_violation():
    firewall = DharmaChakraFirewall()
    res = firewall.validate_prediction(
        predicted_class="urban",
        dem_slope_deg=1.0,
        optical_mndwi=-0.2,
        sar_sigma0_vv_db=-8.0,
        albedo=1.35,  # Unphysical albedo
        trace_t3=0.8,
        i_incident=1.0
    )
    assert res["passed"] is False
    assert "Physical Albedo Bounds" in res["rejection_reason"]
