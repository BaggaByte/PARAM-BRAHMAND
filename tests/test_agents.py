"""
Unit tests for Layer 3 (Sankalpa-Param Router) & Layer 4 (Navagraha Specialist Ensemble).
"""

from param_brahmand.agents.router import SankalpaParamRouter
from param_brahmand.agents.navagraha import NavagrahaEnsemble

def test_sankalpa_routing_flood():
    router = SankalpaParamRouter()
    assert router.route_query("Is there sub-canopy water or flood in this forest?") == "kaal_radar"

def test_sankalpa_routing_vehicles():
    router = SankalpaParamRouter()
    assert router.route_query("Count all heavy transport vehicles in the logistics yard") == "bhoomi_optical"

def test_sankalpa_routing_subsidence():
    router = SankalpaParamRouter()
    assert router.route_query("Check DInSAR ground sinking in Joshimath town") == "ratna_garbha"

def test_sankalpa_routing_causal():
    router = SankalpaParamRouter()
    assert router.route_query("Why is biomass down in Chambal? Deforestation or Rabi harvest?") == "vivek_causal"

def test_vivek_causal_harvest_disambiguation():
    res = NavagrahaEnsemble.run_vivek_causal("harvest inquiry", {"month": 4})
    assert res["is_false_alarm_harvest"] is True
    assert res["causal_intervention_effect"] > 0.90

def test_ratna_garbha_subsidence():
    res = NavagrahaEnsemble.run_ratna_garbha("joshimath", {"subsidence_mm_mo": 2.1})
    assert res["measured_subsidence_rate_mm_per_mo"] == 2.1
    assert res["cumulative_annual_deformation_cm"] > 2.0
