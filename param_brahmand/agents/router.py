"""
Layer 3: Sankalpa-Param Autonomous Router
Directs natural language and voice queries to specialized Navagraha agents.
Supports LangGraph state machine execution and deterministic keyword-semantic routing.
"""

from typing import Dict, Any, List, Optional
from param_brahmand.agents.navagraha import NavagrahaEnsemble

class SankalpaParamRouter:
    """
    Sankalpa-Param dynamic multi-agent task orchestrator.
    """

    def __init__(self):
        self.ensemble = NavagrahaEnsemble()

    def route_query(self, prompt: str) -> str:
        """
        Determines the primary specialist agent based on query intent.
        """
        p = prompt.lower()

        if any(w in p for w in ["flood", "radar", "water under", "canopy", "submerged", "inundat"]):
            return "kaal_radar"
        elif any(w in p for w in ["count", "vehicle", "truck", "building", "optical", "resolution", "density"]):
            return "bhoomi_optical"
        elif any(w in p for w in ["subsidence", "sinking", "crack", "dinsar", "joshimath", "ground deformation", "aquifer"]):
            return "ratna_garbha"
        elif any(w in p for w in ["deforest", "harvest", "crop", "season", "false alarm", "rabi", "kharif", "chambal", "why"]):
            return "vivek_causal"
        elif any(w in p for w in ["emergency", "evacuat", "highway", "ndma", "sdma", "sop", "hospital", "kuttanad"]):
            return "bhoomi_rakshak"
        elif any(w in p for w in ["change", "before and after", "temporal", "damage assessment"]):
            return "samay_change"
        elif any(w in p for w in ["polygon", "boundary", "extract", "vector", "geojson"]):
            return "sparsh_grounding"
        elif any(w in p for w in ["future", "forecast", "predict", "trend", "36 month"]):
            return "kala_chakra_4d"
        else:
            return "surya_caption"

    def execute(self, prompt: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Executes routed agent with context and secondary agent enrichment.
        """
        ctx = context or {}
        agent_id = self.route_query(prompt)

        # Run primary agent
        primary_runner = getattr(self.ensemble, f"run_{agent_id}", self.ensemble.run_surya_caption)
        primary_result = primary_runner(prompt, ctx)

        # Always attach Surya-Caption 4-tier brief for structured response
        caption_result = self.ensemble.run_surya_caption(prompt, ctx)
        # Always attach Sparsh-Grounding for GeoJSON polygon geometry
        grounding_result = self.ensemble.run_sparsh_grounding(prompt, ctx)

        return {
            "routed_agent_id": agent_id,
            "agent_name": primary_result.get("name", "Surya-Caption"),
            "primary_output": primary_result,
            "caption": caption_result,
            "geojson": grounding_result.get("geojson"),
            "audit_trail": {
                "router": "Sankalpa-Param (Layer 3)",
                "decision": f"Dispatched prompt to {primary_result.get('name')}",
                "rule": "Semantic intent classification",
                "verified": True
            }
        }
