"""
Lightweight test runner executing all PARAM-BRAHMAND test suites.
"""

import sys
import os

# Add workspace to sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from tests.test_prakriti_veda import (
    test_manifold_128_channels,
    test_yamaguchi_ag4u_powers,
    test_mesma_unmixing_sum_to_one,
    test_oswi_inundation_index,
)
from tests.test_dharma_chakra import (
    test_firewall_all_pass,
    test_firewall_rejects_hydrodynamic_slope_violation,
    test_firewall_rejects_stokes_energy_violation,
    test_firewall_rejects_albedo_bound_violation,
)
from tests.test_geo_mamba import (
    test_sirti_embedding_dimension,
    test_geomamba_bidirectional_scan,
    test_geomamba_model_tile_processing,
)
from tests.test_agents import (
    test_sankalpa_routing_flood,
    test_sankalpa_routing_vehicles,
    test_sankalpa_routing_subsidence,
    test_sankalpa_routing_causal,
    test_vivek_causal_harvest_disambiguation,
    test_ratna_garbha_subsidence,
)
from tests.test_pipeline import (
    test_full_pipeline_success,
    test_full_pipeline_firewall_rejection,
)
from tests.test_phase_a_modules import (
    # Losses
    test_dice_loss_perfect,
    test_dice_loss_worst,
    test_sadf_loss_identical,
    test_physics_loss_valid_stokes,
    test_physics_loss_stokes_violation,
    test_multitask_loss_computes,
    # Datasets
    test_bigearthnet_length_and_item,
    test_vrsbench_length_and_item,
    test_cdvqa_length_and_item,
    # Benchmark
    test_benchmark_suite_runs_all,
    test_benchmark_dharma_firewall,
    # Sensor engines
    test_trishna_simulates_8_bands,
    test_trishna_lst_retrieval_accuracy,
    test_hyis_200_bands,
    test_nisar_dual_band,
    test_cartosat3_brovey_fuse,
    test_sensor_registry_all_sensors,
    test_sensor_registry_run_nisar,
    # GeoJSON Vectorizer
    test_vectorizer_bbox_to_geojson,
    test_vectorizer_point_to_geojson,
    test_vectorizer_mask_to_geojson,
    test_vectorizer_wgs84_coordinates_in_range,
)

def run_suite():
    tests = [
        # Prakriti-Veda
        ("test_manifold_128_channels", test_manifold_128_channels),
        ("test_yamaguchi_ag4u_powers", test_yamaguchi_ag4u_powers),
        ("test_mesma_unmixing_sum_to_one", test_mesma_unmixing_sum_to_one),
        ("test_oswi_inundation_index", test_oswi_inundation_index),
        # Dharma-Chakra
        ("test_firewall_all_pass", test_firewall_all_pass),
        ("test_firewall_rejects_hydrodynamic_slope_violation", test_firewall_rejects_hydrodynamic_slope_violation),
        ("test_firewall_rejects_stokes_energy_violation", test_firewall_rejects_stokes_energy_violation),
        ("test_firewall_rejects_albedo_bound_violation", test_firewall_rejects_albedo_bound_violation),
        # Geo-Mamba
        ("test_sirti_embedding_dimension", test_sirti_embedding_dimension),
        ("test_geomamba_bidirectional_scan", test_geomamba_bidirectional_scan),
        ("test_geomamba_model_tile_processing", test_geomamba_model_tile_processing),
        # Agents
        ("test_sankalpa_routing_flood", test_sankalpa_routing_flood),
        ("test_sankalpa_routing_vehicles", test_sankalpa_routing_vehicles),
        ("test_sankalpa_routing_subsidence", test_sankalpa_routing_subsidence),
        ("test_sankalpa_routing_causal", test_sankalpa_routing_causal),
        ("test_vivek_causal_harvest_disambiguation", test_vivek_causal_harvest_disambiguation),
        ("test_ratna_garbha_subsidence", test_ratna_garbha_subsidence),
        # Pipeline
        ("test_full_pipeline_success", test_full_pipeline_success),
        ("test_full_pipeline_firewall_rejection", test_full_pipeline_firewall_rejection),
        # Phase A — Losses
        ("test_dice_loss_perfect", test_dice_loss_perfect),
        ("test_dice_loss_worst", test_dice_loss_worst),
        ("test_sadf_loss_identical", test_sadf_loss_identical),
        ("test_physics_loss_valid_stokes", test_physics_loss_valid_stokes),
        ("test_physics_loss_stokes_violation", test_physics_loss_stokes_violation),
        ("test_multitask_loss_computes", test_multitask_loss_computes),
        # Phase A — Datasets
        ("test_bigearthnet_length_and_item", test_bigearthnet_length_and_item),
        ("test_vrsbench_length_and_item", test_vrsbench_length_and_item),
        ("test_cdvqa_length_and_item", test_cdvqa_length_and_item),
        # Phase A — Benchmark Suite
        ("test_benchmark_suite_runs_all", test_benchmark_suite_runs_all),
        ("test_benchmark_dharma_firewall", test_benchmark_dharma_firewall),
        # Phase A — Sensor Engines
        ("test_trishna_simulates_8_bands", test_trishna_simulates_8_bands),
        ("test_trishna_lst_retrieval_accuracy", test_trishna_lst_retrieval_accuracy),
        ("test_hyis_200_bands", test_hyis_200_bands),
        ("test_nisar_dual_band", test_nisar_dual_band),
        ("test_cartosat3_brovey_fuse", test_cartosat3_brovey_fuse),
        ("test_sensor_registry_all_sensors", test_sensor_registry_all_sensors),
        ("test_sensor_registry_run_nisar", test_sensor_registry_run_nisar),
        # Phase A — GeoJSON Vectorizer
        ("test_vectorizer_bbox_to_geojson", test_vectorizer_bbox_to_geojson),
        ("test_vectorizer_point_to_geojson", test_vectorizer_point_to_geojson),
        ("test_vectorizer_mask_to_geojson", test_vectorizer_mask_to_geojson),
        ("test_vectorizer_wgs84_coordinates_in_range", test_vectorizer_wgs84_coordinates_in_range),
    ]

    passed = 0
    failed = 0
    print("=" * 70)
    print("PARAM-BRAHMAND: Executing 7-Layer Physics-AI Test Suite")
    print("=" * 70)

    for name, func in tests:
        try:
            func()
            print(f"  [OK] {name:<50} [PASSED]")
            passed += 1
        except Exception as e:
            import traceback
            tb = traceback.format_exc().strip().split("\n")[-1]
            print(f"  [X]  {name:<50} [FAILED: {tb}]")
            failed += 1

    print("-" * 70)
    print(f"Summary: {passed} passed, {failed} failed out of {len(tests)} tests.")
    print("=" * 70)

    if failed > 0:
        sys.exit(1)

if __name__ == "__main__":
    run_suite()
