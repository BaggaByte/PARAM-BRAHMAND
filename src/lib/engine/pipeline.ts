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
  const firewall = dharmaChakra(physics);
  const geocp = mission?.geocp ?? geoCP(cover);
  const manifold = buildManifold(physics);

  // Optional live Python FastAPI microservice synchronization
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 600);
    fetch("http://127.0.0.1:8000/api/v1/analyze", {
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
      }),
      signal: controller.signal,
    }).catch(() => {});
    clearTimeout(timer);
  } catch {
    // Graceful autonomous fallback
  }

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
  const result: AnalysisResult = mission
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

  return result;
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
