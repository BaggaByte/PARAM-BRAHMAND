"""
PARAM-BRAHMAND Complete Production System
==========================================
Vishwaroopa-AI -- 7-Layer Earth Intelligence OS
Smart India Hackathon 2026 . ISRO SAC Problem Statement PS 26167

This master script demonstrates the full end-to-end system in a single
runnable file. It exercises every layer of the pipeline and all 9
Navagraha specialist agents.

Usage:
    python param_brahmand_complete_system.py [--benchmark] [--demo-mission MISSION]

Options:
    --benchmark         Run automated benchmark evaluation suite
    --demo-mission ID   Run a specific demo mission (kaziranga | joshimath | chambal | kuttanad)
"""

import os
import sys
import argparse
import time

# Ensure workspace root is in sys.path
_ROOT = os.path.dirname(os.path.abspath(__file__))
if _ROOT not in sys.path:
    sys.path.insert(0, _ROOT)

# Ensure UTF-8 output on all platforms (critical for Windows cp1252)
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

# ─────────────────────────────────────────────────────────────────────────────
# System Check
# ─────────────────────────────────────────────────────────────────────────────

def _check_modules():
    """Verify all PARAM-BRAHMAND modules are importable."""
    required = [
        ("param_brahmand.physics.prakriti_veda",   "PrakritiVedaManifold"),
        ("param_brahmand.physics.dharma_chakra",   "DharmaChakraFirewall"),
        ("param_brahmand.physics.geocp",           "GeoCPCalibration"),
        ("param_brahmand.models.geo_mamba",        "GeoMambaModel"),
        ("param_brahmand.agents.navagraha",        "NavagrahaEnsemble"),
        ("param_brahmand.agents.router",           "SankalpaParamRouter"),
        ("param_brahmand.voice.bhasha_brahmand",   "BhashaBrahmandEngine"),
        ("param_brahmand.data.cog_streamer",       "WindowedCOGStreamer"),
        ("param_brahmand.evaluation.metrics",      "EvaluationMetrics"),
        ("param_brahmand.pipeline",                "ParamBrahmandPipeline"),
        ("param_brahmand.training.losses",         "PhysicsGuidedMultiTaskLoss"),
        ("param_brahmand.training.datasets",       "BigEarthNetDataset"),
        ("param_brahmand.training.benchmark_suite","ParamBrahmandBenchmarkEvaluator"),
        ("param_brahmand.sensors.sensor_engines",  "SensorEngineRegistry"),
        ("param_brahmand.utils.geojson_vectorizer","WGS84SubPixelVectorizer"),
    ]
    print("\n📦 Module Import Verification")
    print("─" * 50)
    all_ok = True
    for module_path, class_name in required:
        try:
            mod = __import__(module_path, fromlist=[class_name])
            getattr(mod, class_name)
            print(f"  ✅ {module_path}.{class_name}")
        except Exception as e:
            print(f"  ❌ {module_path}.{class_name}: {e}")
            all_ok = False
    return all_ok


# ─────────────────────────────────────────────────────────────────────────────
# Demo Missions
# ─────────────────────────────────────────────────────────────────────────────

DEMO_MISSIONS = {
    "kaziranga": {
        "name": "Kaziranga Inundation Monitor",
        "query": "क्या बाढ़ का पानी हाईवे NH-715 तक पहुँच गया है?",
        "language": "hi",
        "center": [26.65, 93.35],
        "dem_slope_deg": 1.8,
        "sigma0_vv_db": -18.5,
        "description": "Kaziranga National Park flood mapping · Kaal-Radar + Vivek-Causal"
    },
    "joshimath": {
        "name": "Joshimath Subsidence Alert",
        "query": "What is the DInSAR subsidence rate in Joshimath town centre?",
        "language": "en",
        "center": [30.55, 79.56],
        "dem_slope_deg": 25.3,
        "sigma0_vv_db": -13.2,
        "description": "Joshimath urban sinking · Ratna-Garbha DInSAR millimetre sensing"
    },
    "chambal": {
        "name": "Chambal Ravine Mapping",
        "query": "Quantify ravine encroachment on agricultural land in Chambal basin",
        "language": "en",
        "center": [26.40, 78.80],
        "dem_slope_deg": 8.7,
        "sigma0_vv_db": -11.5,
        "description": "Chambal ravines · Sparsh-Grounding sub-pixel segmentation"
    },
    "kuttanad": {
        "name": "Kuttanad Below Sea-Level Flood",
        "query": "കുട്ടനാട്ടിൽ ഉള്ള വെള്ളക്കെട്ട് ഏത് ഗ്രാമങ്ങളിൽ?",
        "language": "ml",
        "center": [9.55, 76.55],
        "dem_slope_deg": 0.3,
        "sigma0_vv_db": -21.0,
        "description": "Kuttanad below-sea-level basin · Bhoomi-Rakshak NDMA alert"
    },
}


def _run_demo_mission(mission_id: str):
    """Run a full 7-layer pipeline on a demo mission."""
    from param_brahmand.pipeline import ParamBrahmandPipeline

    mission = DEMO_MISSIONS.get(mission_id)
    if not mission:
        print(f"Unknown mission: {mission_id}. Choose from: {list(DEMO_MISSIONS)}")
        return

    print(f"\n🛰  {mission['name']}")
    print(f"    {mission['description']}")
    print(f"    Center: {mission['center']}  |  Language: {mission['language']}")
    print(f"    Query: {mission['query']}\n")
    print("─" * 60)

    pipeline = ParamBrahmandPipeline()
    t0 = time.perf_counter()
    result = pipeline.run(
        query=mission["query"],
        language=mission["language"],
        center=mission["center"],
        dem_slope_deg=mission["dem_slope_deg"],
        sigma0_vv_db=mission["sigma0_vv_db"],
    )
    elapsed_ms = round((time.perf_counter() - t0) * 1000, 1)

    status_icon = "✅" if result["status"] == "SUCCESS" else "🛑"
    print(f"\n  {status_icon}  Status       : {result['status']}")
    print(f"  🎯  Routed Agent  : {result.get('routed_agent', 'N/A')}")
    print(f"  ⏱   Latency      : {elapsed_ms} ms")
    print(f"  🔒  Dharma Pass  : {result['firewall']['passed']}")
    print(f"  📐  128-D Channels: {result['manifold_summary']['total_channels']}")
    print(f"  🌍  GeoJSON Type : {result['geojson']['type']}")

    print("\n  📋 Trace Steps:")
    for step in result.get("trace_steps", []):
        layer = step.get("layer", "")
        label = step.get("label", "")
        status = step.get("status", "")
        icon = "✅" if "PASS" in status or "COMPLETE" in status else "⚙"
        print(f"     {icon} [{layer}] {label}")

    confidence = result["conformal_calibration"].get("calibrated_coverage", 0)
    print(f"\n  🎓  Conformal Coverage : {confidence:.3f} ({confidence*100:.1f}%)")
    print(f"  📊  Benchmark Target  : >95.0% (GeoCP-v2 α=0.05)")

    if not result["firewall"]["passed"]:
        violations = result["firewall"].get("violations", [])
        print(f"\n  ⚠  Firewall violations: {violations}")

    return result


# ─────────────────────────────────────────────────────────────────────────────
# Benchmark Mode
# ─────────────────────────────────────────────────────────────────────────────

def _run_benchmark():
    from param_brahmand.training.benchmark_suite import ParamBrahmandBenchmarkEvaluator
    ev = ParamBrahmandBenchmarkEvaluator()
    report = ev.run_all()
    ev.print_report(report)
    return report


# ─────────────────────────────────────────────────────────────────────────────
# Sensor Demo
# ─────────────────────────────────────────────────────────────────────────────

def _run_sensor_demo():
    from param_brahmand.sensors.sensor_engines import SensorEngineRegistry
    reg = SensorEngineRegistry()

    print("\n🛰  Sensor Engine Demonstration")
    print("─" * 50)

    # TRISHNA
    r = reg.run("TRISHNA", lst_k=310.0, emissivity=0.97)
    print(f"\n  TRISHNA Thermal:")
    print(f"    Input LST    : {r['input_lst_k']} K")
    print(f"    Retrieved LST: {r['retrieved_lst_k']} K  (error: {r['lst_accuracy_k']} K)")
    print(f"    TIR bands    : {len(r['bands'])} bands (8.0–12.0 μm)")

    # NISAR
    r = reg.run("NISAR", surface="agricultural", deformation_mm=-28.5, soil_moisture_pct=35.0)
    print(f"\n  NISAR L+S Band:")
    print(f"    L-band σ⁰ VV : {r['l_band']['sigma0_vv_db']} dB")
    print(f"    S-band σ⁰ VV : {r['s_band']['sigma0_vv_db']} dB")
    print(f"    DInSAR phase : {r['interferometry']['dinsar_phase_rad']:.3f} rad  ({r['interferometry']['deformation_input_mm']} mm)")
    print(f"    Coherence    : {r['interferometry']['temporal_coherence']}")

    # HysIS
    r = reg.run("HysIS", surface_type="vegetation", chlorophyll_ug_cm2=45.0)
    print(f"\n  HysIS Hyperspectral:")
    print(f"    Bands   : {r['n_bands']} (400–2500 nm @ 10 nm resolution)")
    print(f"    Red-Edge: {r['dominant_index']}")

    # Cartosat-3
    r = reg.run("Cartosat3", pan_reflectance=0.18, ms_blue=0.08, ms_green=0.10, ms_red=0.12, ms_nir=0.35)
    print(f"\n  Cartosat-3 PAN Fusion:")
    print(f"    PAN GSD : {r['pan_gsd_m']} m  |  MS GSD: {r['ms_gsd_m']} m")
    print(f"    NDVI    : {r['ndvi']}")


# ─────────────────────────────────────────────────────────────────────────────
# GeoJSON Demo
# ─────────────────────────────────────────────────────────────────────────────

def _run_geojson_demo():
    from param_brahmand.utils.geojson_vectorizer import WGS84SubPixelVectorizer

    print("\n🗺  WGS84 Sub-Pixel Vectorizer Demo")
    print("─" * 50)

    vec = WGS84SubPixelVectorizer(
        center_lat=26.65, center_lon=93.35, gsd_m=0.5,
        image_width_px=512, image_height_px=512
    )

    # BBox vectorization
    bboxes = [
        [140, 210, 48, 22],
        [180, 240, 24, 14],
        [80,  95, 120, 85],
    ]
    names = ["Heavy Transport Truck", "Light Vehicle", "Concrete Structure"]
    confs = [0.942, 0.918, 0.965]

    geojson = vec.bbox_to_geojson(bboxes, names, confs, mission_id="KAZIRANGA-001")
    print(f"\n  BBox → GeoJSON:")
    print(f"    Features     : {len(geojson['features'])}")
    print(f"    Type         : {geojson['type']}")
    print(f"    CRS          : {geojson['metadata']['projection']}")
    print(f"    Standard     : {geojson['metadata']['standard']}")
    for f in geojson["features"]:
        p = f["properties"]
        lon, lat = f["geometry"]["coordinates"][0][0]
        print(f"    [{p['feature_id']}] {p['class']:<30}  conf={p['confidence']}  area={p['area_m2']} m²  "
              f"lon={lon:.6f} lat={lat:.6f}")


# ─────────────────────────────────────────────────────────────────────────────
# Main Entry Point
# ─────────────────────────────────────────────────────────────────────────────

BANNER = """
╔══════════════════════════════════════════════════════════════════════════╗
║                                                                          ║
║   ██████╗  █████╗ ██████╗  █████╗ ███╗   ███╗                           ║
║   ██╔══██╗██╔══██╗██╔══██╗██╔══██╗████╗ ████║                           ║
║   ██████╔╝███████║██████╔╝███████║██╔████╔██║                           ║
║   ██╔═══╝ ██╔══██║██╔══██╗██╔══██║██║╚██╔╝██║                           ║
║   ██║     ██║  ██║██║  ██║██║  ██║██║ ╚═╝ ██║                           ║
║   ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝                           ║
║                                                                          ║
║   BRAHMAND — परम-ब्रह्माण्ड · विश्वरूप-AI                                ║
║   7-Layer Earth Intelligence OS (Geo-Mamba 3.0)                         ║
║   Smart India Hackathon 2026 · ISRO SAC PS 26167                        ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
"""


def main():
    print(BANNER)

    parser = argparse.ArgumentParser(description="PARAM-BRAHMAND Complete Production System")
    parser.add_argument("--benchmark", action="store_true", help="Run full benchmark evaluation suite")
    parser.add_argument("--demo-mission", choices=list(DEMO_MISSIONS), help="Run a demo mission")
    parser.add_argument("--sensors", action="store_true", help="Run sensor engine demonstration")
    parser.add_argument("--geojson", action="store_true", help="Run GeoJSON vectorizer demonstration")
    parser.add_argument("--check", action="store_true", help="Module import verification only")
    parser.add_argument("--all", action="store_true", help="Run everything: check + all demos + benchmark")
    args = parser.parse_args()

    # Default: run everything if no args
    run_all = args.all or not any([args.benchmark, args.demo_mission, args.sensors, args.geojson, args.check])

    # 1. Module check
    print("=" * 72)
    print("  STEP 1 — Module Verification")
    print("=" * 72)
    ok = _check_modules()
    if not ok:
        print("\n❌ Module verification failed. Check your PYTHONPATH and installation.")
        sys.exit(1)
    print("\n✅ All 15 PARAM-BRAHMAND modules verified.")

    if args.check:
        return

    # 2. Mission demos
    if run_all or args.demo_mission:
        missions_to_run = [args.demo_mission] if args.demo_mission else list(DEMO_MISSIONS)
        print("\n" + "=" * 72)
        print("  STEP 2 — Mission Pipeline Demonstrations")
        print("=" * 72)
        for mid in missions_to_run:
            _run_demo_mission(mid)
            print()

    # 3. Sensor engines
    if run_all or args.sensors:
        print("\n" + "=" * 72)
        print("  STEP 3 — Sensor Engine Simulations")
        print("=" * 72)
        _run_sensor_demo()

    # 4. GeoJSON vectorizer
    if run_all or args.geojson:
        print("\n" + "=" * 72)
        print("  STEP 4 — WGS84 GeoJSON Vectorizer")
        print("=" * 72)
        _run_geojson_demo()

    # 5. Benchmark evaluation
    if run_all or args.benchmark:
        print("\n" + "=" * 72)
        print("  STEP 5 — Automated Benchmark Evaluation")
        print("=" * 72)
        _run_benchmark()

    print("\n" + "=" * 72)
    print("  PARAM-BRAHMAND Complete System Demo — DONE")
    print("  परम-ब्रह्माण्ड · SIH-2026 · ISRO SAC PS 26167")
    print("=" * 72 + "\n")


if __name__ == "__main__":
    main()
