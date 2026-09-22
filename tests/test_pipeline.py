"""
End-to-end integration test for the 7-Layer ParamBrahmandPipeline.
"""

from param_brahmand.pipeline import ParamBrahmandPipeline

def test_full_pipeline_success():
    pipeline = ParamBrahmandPipeline()
    res = pipeline.run(
        query="क्या बाढ़ का पानी हाईवे तक पहुँच गया है?",
        language="hi",
        center=[26.65, 93.35],
        dem_slope_deg=1.8,
        sigma0_vv_db=-18.5
    )

    assert res["status"] == "SUCCESS"
    assert res["routed_agent"] == "kaal_radar"
    assert len(res["trace_steps"]) == 7
    assert res["firewall"]["passed"] is True
    assert res["conformal_calibration"]["calibrated_coverage"] >= 0.95
    assert res["manifold_summary"]["total_channels"] == 128
    assert res["geojson"]["type"] == "Feature"

def test_full_pipeline_firewall_rejection():
    pipeline = ParamBrahmandPipeline()
    # Water on an impossible 15 deg slope
    res = pipeline.run(
        query="Map standing flood water",
        language="en",
        center=[30.55, 79.56],
        dem_slope_deg=15.2,
        predicted_class="standing_water"
    )

    assert res["status"] == "FIREWALL_HALTED"
    assert res["firewall"]["passed"] is False
