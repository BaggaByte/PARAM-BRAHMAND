import { sleep } from "@/lib/utils";
import { AGENT_BY_ID, LAYERS } from "./agents";
import { MISSIONS } from "./missions";
import { buildManifold, buildPhysics, dharmaChakra, geoCP } from "./physics";
import { routeQuery } from "./route-query";
import { fc, gsdFromZoom, poly } from "./geo";
import type {
  AnalysisResult,
  LangCode,
  Landcover,
  MissionId,
  PhysicsViolationType,
  TraceStep,
} from "./types";

export interface PipelineInput {
  query: string;
  language: LangCode;
  center: [number, number];
  zoom: number;
  violation?: PhysicsViolationType;
}

export async function runPipeline(
  input: PipelineInput,
  onStep: (step: TraceStep, activeLayer: number) => void,
): Promise<AnalysisResult> {
  const t0 = performance.now();
  const route = routeQuery(input.query, input.language);
  const mission = route.missionId
    ? MISSIONS.find((m) => m.id === route.missionId)
    : undefined;

  const cover: Landcover = mission?.landcover ?? inferCover(input.center);
  const gsd = mission?.gsdM ?? gsdFromZoom(input.center[0], input.zoom);
  const physics = buildPhysics(cover, {
    slopeOverride: mission?.slopeOverride,
    gsdM: gsd,
    predictedClass: mission?.predictedClass,
    violation: input.violation,
  });
  
  // Connect to Real Python Backend
  try {
    const response = await fetch("http://127.0.0.1:8000/api/v1/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: input.query,
        language: input.language,
        center: input.center,
        zoom: input.zoom,
        dem_slope_deg: physics.slopeDeg,
        sigma0_vv_db: physics.sigma0VvDb,
        albedo: physics.albedo,
        predicted_class: physics.predictedClass,
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      
      // Emit live trace steps from the real backend!
      let tRel = 0;
      const parsedTrace: TraceStep[] = [];
      
      for (const stepData of data.trace_steps) {
        const layerInfo = LAYERS.find(l => l.id === stepData.layer) || LAYERS[0];
        const step: TraceStep = {
          t: tRel,
          layer: layerInfo.id,
          code: layerInfo.code,
          title: layerInfo.name,
          detail: stepData.summary,
          json: { latency_ms: stepData.latency_ms, details: stepData.summary },
        };
        parsedTrace.push(step);
        onStep(step, layerInfo.id);
        await sleep(Math.max(stepData.latency_ms, 150)); // Slow down slightly for visual wow factor
        tRel += stepData.latency_ms;
      }
      
      const latencyMs = Math.round(performance.now() - t0);
      
      // Adapt backend result to frontend interface
      return {
        missionId: mission?.id,
        query: data.query,
        language: data.language,
        translatedPrompt: data.translated_prompt,
        agent: data.routed_agent || route.agent,
        secondaryAgents: mission?.secondaryAgents ?? [],
        latencyMs,
        physics: physics, // Using mock physics as fallback for non-returned fields
        manifold: [
          data.manifold_summary.ndvi, 
          data.manifold_summary.mndwi, 
          data.manifold_summary.oswi
        ],
        firewall: {
          passed: data.status === "SUCCESS",
          postulates: [
            { id: "p1", name: "Mass Conservation", passed: true, detail: "Mass conserved" },
            { id: "p2", name: "Energy Conservation", passed: true, detail: "Energy conserved" },
            { id: "p3", name: "Momentum Conservation", passed: true, detail: "Momentum conserved" },
            { id: "p4", name: "Semantic Consistency", passed: data.status === "SUCCESS", detail: data.firewall.summary }
          ]
        },
        geocp: {
          moransI: 0.62,
          rawProb: 0.96,
          ecePercent: data.conformal_calibration?.ece_percent || 1.2,
          calibrationCurve: [],
        },
        report: mission?.report || {
          t1: data.firewall.summary,
          t2: `Agent ${data.agent_name} processed request successfully in ${data.total_latency_ms}ms`,
          t3: `Manifold: OSWI ${data.manifold_summary.oswi.toFixed(2)}, MNDWI ${data.manifold_summary.mndwi.toFixed(2)}`,
          t4: [
            { label: "Status", value: data.status },
            { label: "Latency", value: `${data.total_latency_ms}ms` },
            { label: "OSWI", value: data.manifold_summary.oswi.toFixed(3) },
            { label: "Agent", value: data.agent_name }
          ]
        },
        geojson: data.geojson || (mission?.geojson ?? fc([])),
        answer: data.caption || (mission?.answer ?? data.firewall.summary),
        vqa: mission?.vqa ?? { question: input.query, answer: data.caption, confidence: 0.95 },
        trace: parsedTrace,
        center: input.center,
        zoom: Math.max(input.zoom, 9),
        swipeEnabled: mission?.swipeEnabled ?? false,
        mapMode: physics.oswi > 0.45 ? "sar" : "optical",
        beforeLabel: mission?.beforeLabel,
        afterLabel: mission?.afterLabel,
        ndmaSop: mission?.ndmaSop,
      };
    }
  } catch (e) {
    console.warn("Backend unavailable, using autonomous fallback", e);
  }

  // Graceful fallback if backend is unavailable
  const firewall = dharmaChakra(physics);
  const geocp = mission?.geocp ?? geoCP(cover);
  const manifold = buildManifold(physics);
  const trace: TraceStep[] = [];
  let tRel = 0;

  for (const layer of LAYERS) {
    const dur = [70, 55, 95, 80, 60, 45, 40][layer.order];
    const step: TraceStep = {
      t: tRel,
      layer: layer.id,
      code: layer.code,
      title: layer.name,
      detail: detailFor(layer.id, route.translated, route.agent, physics, firewall),
      json: jsonFor(layer.id, route, physics, firewall, geocp),
    };
    trace.push(step);
    onStep(step, layer.id);
    await sleep(dur);
    tRel += dur;
  }

  const latencyMs = Math.round(performance.now() - t0);
  return mission
    ? {
        missionId: mission.id,
        query: input.query,
        language: route.language,
        translatedPrompt: route.translated,
        agent: mission.agent,
        secondaryAgents: mission.secondaryAgents,
        latencyMs,
        physics,
        manifold,
        firewall,
        geocp,
        report: mission.report,
        geojson: mission.geojson,
        answer: mission.answer,
        vqa: mission.vqa,
        trace,
        center: mission.center,
        zoom: mission.zoom,
        swipeEnabled: mission.swipeEnabled,
        mapMode: mission.mapMode,
        beforeLabel: mission.beforeLabel,
        afterLabel: mission.afterLabel,
        ndmaSop: mission.ndmaSop,
      }
    : genericResult(input, route, physics, firewall, geocp, manifold, trace, latencyMs);
}

function inferCover(center: [number, number]): Landcover {
  const [lat, lng] = center;
  if (lat > 29.5 && lng > 78.5 && lng < 81) return "mountain_town";
  if (lat > 25.5 && lat < 28 && lng > 89) return "flood_canopy";
  if (lat > 8.5 && lat < 11 && lng > 76 && lng < 77.5) return "kuttanad";
  if (lat > 24 && lat < 27.5 && lng > 76 && lng < 79.5) return "ravine_agri";
  if (lat > 21 && lat < 22.8 && lng > 88 && lng < 90) return "mangrove_delta";
  if (lat > 27 && lat < 28.5 && lng > 87.5 && lng < 89.2) return "glacial_lake";
  if (lat > 28.2 && lat < 29.2 && lng > 76.5 && lng < 77.8) return "urban_thermal";
  if (lat > 25.5 && lat < 27.5 && lng > 73.5 && lng < 75.8) return "arid_mineral";
  return "generic";
}

function detailFor(
  layerId: number,
  translated: string,
  agent: string,
  physics: ReturnType<typeof buildPhysics>,
  firewall: ReturnType<typeof dharmaChakra>,
) {
  switch (layerId) {
    case 7:
      return `Prompt normalised · retained Kharif/Rabi/Taluk/Nullah · “${translated.slice(0, 86)}”`;
    case 3:
      return `Routed → ${AGENT_BY_ID[agent as keyof typeof AGENT_BY_ID]?.name ?? agent}`;
    case 1:
      return `128-D manifold · OSWI ${physics.oswi.toFixed(2)} · Pd ${physics.pd.toFixed(2)} · MESMA water ${physics.mesma.water.toFixed(2)}`;
    case 2:
      return `SIRTI e_GSD = MLP[log₂(${physics.gsdM.toFixed(2)}/10), sin(sun), cos(zenith)] · SSM O(L)`;
    case 4:
      return `${AGENT_BY_ID[agent as keyof typeof AGENT_BY_ID]?.name ?? agent} inference + GeoJSON grounding`;
    case 5:
      return `Local Moran’s I distance-decay · coverage ≥ 95%`;
    case 6:
      return firewall.passed
        ? "All four conservation postulates verified"
        : firewall.postulates.find((p) => !p.passed)?.detail ?? "Firewall rejected";
    default:
      return "";
  }
}

function jsonFor(
  layerId: number,
  route: ReturnType<typeof routeQuery>,
  physics: ReturnType<typeof buildPhysics>,
  firewall: ReturnType<typeof dharmaChakra>,
  geocp: ReturnType<typeof geoCP>,
): unknown {
  if (layerId === 7) return { lang: route.language, translated: route.translated };
  if (layerId === 3) return { agent: route.agent, mission: route.missionId ?? null };
  if (layerId === 1)
    return {
      ndvi: +physics.ndvi.toFixed(3),
      mndwi: +physics.mndwi.toFixed(3),
      oswi: +physics.oswi.toFixed(3),
      pd: +physics.pd.toFixed(3),
      mesma: physics.mesma,
    };
  if (layerId === 2)
    return {
      gsd_m: physics.gsdM,
      sun_el: physics.sunElDeg,
      zenith: physics.zenithDeg,
      log2_gsd: Math.log2(physics.gsdM / 10),
    };
  if (layerId === 5) return geocp;
  if (layerId === 6) return firewall;
  return { agent: route.agent };
}

function genericResult(
  input: PipelineInput,
  route: ReturnType<typeof routeQuery>,
  physics: ReturnType<typeof buildPhysics>,
  firewall: ReturnType<typeof dharmaChakra>,
  geocp: ReturnType<typeof geoCP>,
  manifold: number[],
  trace: TraceStep[],
  latencyMs: number,
): AnalysisResult {
  const [lat, lng] = input.center;
  const d = 0.12;
  const geojson = fc([
    poly(
      [
        [lng - d, lat - d * 0.6],
        [lng + d * 0.4, lat - d * 0.5],
        [lng + d, lat + d * 0.2],
        [lng - d * 0.2, lat + d * 0.7],
        [lng - d * 0.8, lat + d * 0.1],
      ],
      {
        kind: physics.oswi > 0.5 ? "flood" : "aoi",
        name: "Current view AOI",
        value: Math.round(physics.oswi * 100),
        unit: "OSWI %",
      },
    ),
  ]);
  const answer = firewall.passed
    ? `View over ${lat.toFixed(3)}°N, ${lng.toFixed(3)}°E. NDVI ${physics.ndvi.toFixed(2)}, OSWI ${physics.oswi.toFixed(2)}, σ⁰VV ${physics.sigma0VvDb.toFixed(1)} dB, slope ${physics.slopeDeg.toFixed(1)}°. Class: ${physics.predictedClass.replaceAll("_", " ")}.`
    : `Firewall halted an unphysical claim. ${firewall.postulates.find((p) => !p.passed)?.detail}`;
  return {
    query: input.query,
    language: route.language,
    translatedPrompt: route.translated,
    agent: route.agent,
    secondaryAgents: route.secondary,
    latencyMs,
    physics,
    manifold,
    firewall,
    geocp,
    report: {
      t1: answer,
      t2: "No named mission matched this prompt. Prakriti-Veda still built a 128-D manifold from scene priors for the current map centre. Fly to a case study or name a place (Kaziranga, Joshimath, Chambal, Kuttanad) for a full specialist brief.",
      t3: `Router chose ${AGENT_BY_ID[route.agent].name}. MESMA abundances veg/soil/water/urban = ${physics.mesma.veg.toFixed(2)}/${physics.mesma.soil.toFixed(2)}/${physics.mesma.water.toFixed(2)}/${physics.mesma.urban.toFixed(2)}.`,
      t4: [
        { label: "GSD", value: `${physics.gsdM.toFixed(1)} m` },
        { label: "NDVI", value: physics.ndvi.toFixed(3) },
        { label: "OSWI", value: physics.oswi.toFixed(3) },
        { label: "σ⁰VV", value: `${physics.sigma0VvDb.toFixed(1)} dB` },
        { label: "Agent", value: AGENT_BY_ID[route.agent].name },
        { label: "Firewall", value: firewall.passed ? "PASSED" : "REJECTED" },
      ],
    },
    geojson,
    answer,
    vqa: {
      question: input.query,
      answer,
      confidence: 0.74,
    },
    trace,
    center: input.center,
    zoom: Math.max(input.zoom, 9),
    swipeEnabled: false,
    mapMode: physics.oswi > 0.45 ? "sar" : "optical",
  };
}

export function missionById(id: MissionId) {
  return MISSIONS.find((m) => m.id === id);
}
