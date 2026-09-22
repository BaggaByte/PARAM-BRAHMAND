"""
Backward-compatible proxy module for PARAM-BRAHMAND FastAPI server.
Directs imports to param_brahmand.api.main.
"""

from param_brahmand.api.main import app, pipeline, firewall, voice_engine

__all__ = ["app", "pipeline", "firewall", "voice_engine"]
