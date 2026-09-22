"""
Test suite for new Phase A modules:
  - param_brahmand.training.losses
  - param_brahmand.training.datasets
  - param_brahmand.training.benchmark_suite
  - param_brahmand.sensors.sensor_engines
  - param_brahmand.utils.geojson_vectorizer
"""

import math
from param_brahmand.training.losses import (
    PhysicsGuidedMultiTaskLoss,
    cider_loss,
    dice_loss,
    sadf_loss,
    physics_consistency_loss,
)
from param_brahmand.training.datasets import (
    BigEarthNetDataset,
    VRSBenchDataset,
    CDVQADataset,
)
from param_brahmand.training.benchmark_suite import ParamBrahmandBenchmarkEvaluator
from param_brahmand.sensors.sensor_engines import (
    TRISHNAThermalEngine,
    HysISHyperspectralEngine,
    NISARDualBandEngine,
    Cartosat3PanSharpener,
    SensorEngineRegistry,
)
from param_brahmand.utils.geojson_vectorizer import WGS84SubPixelVectorizer


# ---------------------------------------------------------------------------
# Loss Tests
# ---------------------------------------------------------------------------

def test_dice_loss_perfect():
    """Perfect prediction should yield Dice loss = 0."""
    mask = [1.0, 1.0, 0.0, 0.0]
    gt   = [1,   1,   0,   0  ]
    loss = dice_loss(mask, gt)
    assert loss < 1e-4, f"Expected ~0, got {loss}"


def test_dice_loss_worst():
    """Complete mismatch should yield Dice loss close to 1."""
    mask = [1.0, 1.0, 1.0]
    gt   = [0,   0,   0  ]
    loss = dice_loss(mask, gt)
    assert loss > 0.9, f"Expected ~1, got {loss}"


def test_sadf_loss_identical():
    """Identical densities should yield near-zero SADF loss."""
    d = [5.0, 10.0, 3.0, 8.0]
    loss = sadf_loss(d, d)
    assert loss < 0.05, f"Expected near zero, got {loss}"


def test_physics_loss_valid_stokes():
    """Valid Stokes parameters should produce low physics loss."""
    loss = physics_consistency_loss(
        stokes_pred={"I": 1.0, "Q": 0.1, "U": 0.1, "V": 0.05},
        stokes_gt=  {"I": 1.0, "Q": 0.1, "U": 0.1, "V": 0.05},
        albedo_pred=0.3,
        albedo_gt=0.3,
        solar_zenith_deg=30.0,
    )
    assert loss < 0.3, f"Expected low violation, got {loss}"


def test_physics_loss_stokes_violation():
    """Polarisation degree > 1 should be penalised."""
    loss = physics_consistency_loss(
        stokes_pred={"I": 0.5, "Q": 0.6, "U": 0.5, "V": 0.4},
        stokes_gt=  {"I": 1.0, "Q": 0.1, "U": 0.1, "V": 0.0},
        albedo_pred=0.3,
        albedo_gt=0.3,
        solar_zenith_deg=30.0,
    )
    assert loss > 0.3, f"Expected high violation, got {loss}"


def test_multitask_loss_computes():
    """Composite loss must return non-negative finite value."""
    loss_fn = PhysicsGuidedMultiTaskLoss()
    batch = {
        "hypothesis": "Flooded rice paddy fields with standing water",
        "references": ["Flooded paddy fields with inundated areas"],
        "pred_mask": [0.9, 0.8, 0.1, 0.05],
        "gt_mask":   [1,   1,   0,   0   ],
        "pred_density": [12.0, 8.5, 20.0],
        "gt_density":   [12.0, 9.0, 20.5],
        "stokes_pred": {"I": 1.0, "Q": 0.2, "U": 0.1, "V": 0.0},
        "stokes_gt":   {"I": 1.0, "Q": 0.2, "U": 0.1, "V": 0.0},
        "albedo_pred": 0.25,
        "albedo_gt":   0.25,
    }
    total, breakdown = loss_fn.compute(batch)
    assert total >= 0.0, f"Total loss must be non-negative, got {total}"
    assert math.isfinite(total), f"Total loss must be finite, got {total}"
    assert "l_dice" in breakdown
    assert "l_physics" in breakdown
    assert "total" in breakdown


# ---------------------------------------------------------------------------
# Dataset Tests
# ---------------------------------------------------------------------------

def test_bigearthnet_length_and_item():
    ds = BigEarthNetDataset(size=10, seed=0)
    assert len(ds) == 10
    item = ds[0]
    assert "s2_bands" in item
    assert "label_vector" in item
    assert len(item["label_vector"]) == 23
    assert item["source"] == "BigEarthNet-MM"


def test_vrsbench_length_and_item():
    ds = VRSBenchDataset(size=5, seed=0)
    assert len(ds) == 5
    item = ds[0]
    assert "caption" in item
    assert "question" in item
    assert "answer" in item


def test_cdvqa_length_and_item():
    ds = CDVQADataset(size=5, seed=0)
    assert len(ds) == 5
    item = ds[0]
    assert "delta_ndvi" in item
    assert "change_type" in item
    assert isinstance(item["changed"], bool)


# ---------------------------------------------------------------------------
# Benchmark Suite Tests
# ---------------------------------------------------------------------------

def test_benchmark_suite_runs_all():
    ev = ParamBrahmandBenchmarkEvaluator()
    report = ev.run_all()
    assert report["total_benchmarks"] == 7
    assert "results" in report
    assert report["pass_rate"] >= 0.0


def test_benchmark_dharma_firewall():
    ev = ParamBrahmandBenchmarkEvaluator()
    result = ev.eval_dharma_firewall()
    assert result["metric"] == "Detection Rate (%)"
    assert result["score"] >= 0.0


# ---------------------------------------------------------------------------
# Sensor Engine Tests
# ---------------------------------------------------------------------------

def test_trishna_simulates_8_bands():
    engine = TRISHNAThermalEngine()
    result = engine.simulate(lst_k=305.0, emissivity=0.97)
    assert result["sensor"] == "TRISHNA"
    assert len(result["bands"]) == 8
    assert all("radiance_w_sr_m2_um" in v for v in result["bands"].values())


def test_trishna_lst_retrieval_accuracy():
    engine = TRISHNAThermalEngine()
    result = engine.simulate(lst_k=300.0)
    # Allow ±10 K for simplified split-window retrieval
    assert abs(result["retrieved_lst_k"] - 300.0) < 10.0


def test_hyis_200_bands():
    engine = HysISHyperspectralEngine()
    result = engine.simulate(surface_type="vegetation")
    assert result["n_bands"] == 200
    assert len(result["wavelengths_nm"]) == 200
    assert len(result["toa_reflectances"]) == 200


def test_nisar_dual_band():
    engine = NISARDualBandEngine()
    result = engine.simulate(surface="agricultural", deformation_mm=-12.5)
    assert "l_band" in result
    assert "s_band" in result
    assert "interferometry" in result
    # DInSAR phase should be non-zero for deformation
    assert result["interferometry"]["dinsar_phase_rad"] != 0.0


def test_cartosat3_brovey_fuse():
    engine = Cartosat3PanSharpener()
    fused = engine.brovey_fuse(pan=0.18, ms_blue=0.08, ms_green=0.10, ms_red=0.12, ms_nir=0.35)
    assert "blue_fused" in fused
    assert fused["fused_gsd_m"] == 0.28


def test_sensor_registry_all_sensors():
    reg = SensorEngineRegistry()
    sensors = reg.available_sensors()
    assert "TRISHNA" in sensors
    assert "HysIS" in sensors
    assert "NISAR" in sensors
    assert "Cartosat3" in sensors


def test_sensor_registry_run_nisar():
    reg = SensorEngineRegistry()
    result = reg.run("NISAR", surface="forest", biomass_t_ha=120.0)
    assert result["sensor"] == "NISAR"


# ---------------------------------------------------------------------------
# GeoJSON Vectorizer Tests
# ---------------------------------------------------------------------------

def test_vectorizer_bbox_to_geojson():
    vec = WGS84SubPixelVectorizer(
        center_lat=26.12, center_lon=91.45, gsd_m=0.5
    )
    geojson = vec.bbox_to_geojson(
        bboxes=[[100, 100, 50, 30], [200, 150, 40, 25]],
        class_names=["Vehicle", "Building"],
        confidences=[0.94, 0.97],
        mission_id="TEST-001",
    )
    assert geojson["type"] == "FeatureCollection"
    assert len(geojson["features"]) == 2
    f = geojson["features"][0]
    assert f["geometry"]["type"] == "Polygon"
    assert f["properties"]["class"] == "Vehicle"
    assert f["properties"]["confidence"] == 0.94


def test_vectorizer_point_to_geojson():
    vec = WGS84SubPixelVectorizer(center_lat=22.5, center_lon=88.3, gsd_m=1.0)
    geojson = vec.point_to_geojson(
        pixel_points=[(100, 100), (200, 200)],
        labels=["Crack", "Sinkhole"],
    )
    assert len(geojson["features"]) == 2
    assert geojson["features"][0]["geometry"]["type"] == "Point"


def test_vectorizer_mask_to_geojson():
    vec = WGS84SubPixelVectorizer(center_lat=26.65, center_lon=93.35, gsd_m=10.0)
    # Simple 5×5 binary mask with a central 3×3 flood region
    mask = [
        [0, 0, 0, 0, 0],
        [0, 1, 1, 1, 0],
        [0, 1, 1, 1, 0],
        [0, 1, 1, 1, 0],
        [0, 0, 0, 0, 0],
    ]
    geojson = vec.mask_to_geojson(mask, class_name="Flood Inundation")
    assert geojson["type"] == "FeatureCollection"
    assert geojson["metadata"]["gsd_m"] == 10.0


def test_vectorizer_wgs84_coordinates_in_range():
    """All coordinates must be valid WGS84 lon/lat."""
    vec = WGS84SubPixelVectorizer(center_lat=20.0, center_lon=80.0, gsd_m=0.5)
    geojson = vec.bbox_to_geojson(bboxes=[[10, 10, 20, 15]])
    coords = geojson["features"][0]["geometry"]["coordinates"][0]
    for lon, lat in coords:
        assert -180 <= lon <= 180, f"Invalid lon: {lon}"
        assert -90  <= lat <= 90,  f"Invalid lat: {lat}"
