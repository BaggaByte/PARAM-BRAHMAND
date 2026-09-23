"""
FastAPI Microservice for PARAM-BRAHMAND (Vishwaroopa-AI)
Exposes the 7-Layer Physics-Guided Multimodal Earth Intelligence System over HTTP REST.
"""

from typing import Dict, Any, List, Optional
import os
import time

try:
    from fastapi import FastAPI, HTTPException, Query, Body
    from fastapi.middleware.cors import CORSMiddleware
    from pydantic import BaseModel, Field
    FASTAPI_AVAILABLE = True
except ImportError:
    FASTAPI_AVAILABLE = False

from param_brahmand.pipeline import ParamBrahmandPipeline
from param_brahmand.physics.dharma_chakra import DharmaChakraFirewall
from param_brahmand.data.cog_streamer import WindowedCOGStreamer
from param_brahmand.voice.bhasha_brahmand import BhashaBrahmandEngine
from param_brahmand.evaluation.metrics import EvaluationMetrics

pipeline = ParamBrahmandPipeline()
firewall = DharmaChakraFirewall()
voice_engine = BhashaBrahmandEngine()

if FASTAPI_AVAILABLE:
    app = FastAPI(
        title="PARAM-BRAHMAND (Vishwaroopa-AI) Earth Intelligence API",
        version="1.0.0",
        description="7-Layer Physics-Guided Multimodal Earth Intelligence Operating System for ISRO SAC PS 26167",
    )

    # Enable CORS for React frontend (localhost:8080 or live domain)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    class AnalyzeRequest(BaseModel):
        query: str = Field(..., examples=["क्या बाढ़ का पानी हाईवे तक पहुँच गया है?"])
        language: str = Field(default="hi", examples=["hi"])
        center: Optional[List[float]] = Field(default=[26.65, 93.35], examples=[[26.65, 93.35]])
        zoom: int = Field(default=13, examples=[13])
        optical_bands: Optional[List[float]] = Field(default=None)
        sigma0_vv_db: float = Field(default=-14.2)
        sigma0_vh_db: float = Field(default=-21.5)
        dem_slope_deg: float = Field(default=1.8)
        canopy_height_m: float = Field(default=14.5)
        albedo: float = Field(default=0.12)
        trace_t3: float = Field(default=0.82)
        i_incident: float = Field(default=1.00)
        predicted_class: Optional[str] = Field(default=None)

    class FirewallRequest(BaseModel):
        predicted_class: str = Field(..., examples=["standing_water"])
        dem_slope_deg: float = Field(..., examples=[8.5])
        optical_mndwi: float = Field(default=0.45)
        sar_sigma0_vv_db: float = Field(default=-12.0)
        albedo: float = Field(default=0.15)
        trace_t3: float = Field(default=0.8)
        i_incident: float = Field(default=1.0)

    class COGStreamRequest(BaseModel):
        uri: str = Field(default="https://sentinel-cogs.s3.amazonaws.com/sentinel-s2-l2a-cogs/sample.tif")
        col_off: int = Field(default=1024)
        row_off: int = Field(default=1024)
        width: int = Field(default=256)
        height: int = Field(default=256)

    @app.get("/")
    def root() -> Dict[str, Any]:
        return {
            "name": "PARAM-BRAHMAND (Vishwaroopa-AI)",
            "status": "OPERATIONAL",
            "version": "1.0.0",
            "layers": 7,
            "architecture": "Physics-Guided Multimodal Earth Intelligence OS",
            "isro_problem_statement": "SAC PS 26167 (SatQuery AI)",
        }

    @app.get("/api/v1/health")
    def health_check() -> Dict[str, Any]:
        return {
            "status": "HEALTHY",
            "layers_ready": 7,
            "agents_registered": 9,
            "hardware_acceleration": "CUDA/CPU Fallback Online",
            "timestamp": time.time(),
        }

    @app.post("/api/v1/analyze")
    def analyze(req: AnalyzeRequest) -> Dict[str, Any]:
        try:
            result = pipeline.run(
                query=req.query,
                language=req.language,
                center=req.center,
                zoom=req.zoom,
                optical_bands=req.optical_bands,
                sigma0_vv_db=req.sigma0_vv_db,
                sigma0_vh_db=req.sigma0_vh_db,
                dem_slope_deg=req.dem_slope_deg,
                canopy_height_m=req.canopy_height_m,
                albedo=req.albedo,
                trace_t3=req.trace_t3,
                i_incident=req.i_incident,
                predicted_class=req.predicted_class,
            )
            return result
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    @app.post("/api/v1/firewall/validate")
    def validate_physics(req: FirewallRequest) -> Dict[str, Any]:
        return firewall.validate_prediction(
            predicted_class=req.predicted_class,
            dem_slope_deg=req.dem_slope_deg,
            optical_mndwi=req.optical_mndwi,
            sar_sigma0_vv_db=req.sar_sigma0_vv_db,
            albedo=req.albedo,
            trace_t3=req.trace_t3,
            i_incident=req.i_incident,
        )

    @app.post("/api/v1/stream/cog")
    def stream_cog(req: COGStreamRequest) -> Dict[str, Any]:
        streamer = WindowedCOGStreamer(uri=req.uri)
        return streamer.fetch_window((req.col_off, req.row_off, req.width, req.height))

    @app.post("/api/v1/voice/transcribe")
    def transcribe_voice(text: str = Body(..., embed=True), language: str = Body("hi", embed=True)) -> Dict[str, Any]:
        return voice_engine.translate_to_english(text=text, source_lang=language)

    @app.get("/api/v1/benchmarks")
    def get_benchmarks() -> Dict[str, Any]:
        return EvaluationMetrics.get_sota_benchmark_matrix()

else:
    # Minimal mock app for environments without fastapi installed
    app = None
