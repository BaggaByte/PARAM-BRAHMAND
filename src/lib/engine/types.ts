export type AgentId =
  | "bhoomi_optical"
  | "kaal_radar"
  | "surya_caption"
  | "sparsh_grounding"
  | "samay_change"
  | "vivek_causal"
  | "kala_chakra"
  | "bhoomi_rakshak"
  | "ratna_garbha";

export type MissionId =
  | "kaziranga"
  | "joshimath"
  | "chambal"
  | "kuttanad"
  | "sundarbans"
  | "lhonak_glof"
  | "delhi_thermal"
  | "rajasthan_mineral";

export type MapMode = "optical" | "sar" | "dem" | "thermal";

export type LangCode =
  | "en"
  | "hi"
  | "bn"
  | "te"
  | "mr"
  | "ta"
  | "ur"
  | "gu"
  | "kn"
  | "or"
  | "ml"
  | "pa"
  | "as"
  | "mai"
  | "sat"
  | "ks"
  | "ne"
  | "kok"
  | "sd"
  | "doi"
  | "mni"
  | "brx"
  | "sa";

export interface AgentBenchmark {
  dataset: string;
  metric: string;
  sota: string;
  ours: string;
  delta: string;
}

export interface AgentInfo {
  id: AgentId;
  sanskrit: string;
  name: string;
  domain: string;
  mechanism: string;
  metric: string;
  description: string;
  mathematics: string;
  sensors: string[];
  benchmarks: AgentBenchmark[];
  sampleQuery: string;
}

export interface LayerInfo {
  id: number;
  order: number;
  code: string;
  name: string;
  sanskrit: string;
  role: string;
  fullTitle: string;
  tensorContract: string;
  equations: string[];
  hardwareSpecs: string;
}

export type PhysicsViolationType = "none" | "stokes" | "hydro" | "specular" | "albedo";
export type SarDisplayMode = "intensity" | "pauli_rgb" | "coherence";

export interface ManifoldChannelMeta {
  index: number;
  name: string;
  bucket: number;
  bucketName: string;
  formula: string;
  sensor: string;
  unit: string;
  description: string;
}

export interface PhysicsSnapshot {
  blue: number;
  green: number;
  red: number;
  nir: number;
  swir1: number;
  swir2: number;
  ndvi: number;
  mndwi: number;
  ndbi: number;
  evi: number;
  nbr: number;
  ndti: number;
  oswi: number;
  slopeDeg: number;
  sigma0VvDb: number;
  sigma0VhDb: number;
  albedo: number;
  traceT3: number;
  iIncident: number;
  canopyHeightM: number;
  ps: number;
  pd: number;
  pv: number;
  ph: number;
  thetaRot: number;
  coherence: number;
  mesma: { veg: number; soil: number; water: number; urban: number; rmse: number };
  gsdM: number;
  sunElDeg: number;
  zenithDeg: number;
  predictedClass: string;
}

export interface FirewallPostulate {
  id: string;
  name: string;
  passed: boolean;
  detail: string;
}

export interface FirewallResult {
  passed: boolean;
  postulates: FirewallPostulate[];
}

export interface GeoCPResult {
  ece: number;
  coverage: number;
  moranI: number;
  interval: [number, number];
  zone: string;
}

export interface TierReport {
  t1: string;
  t2: string;
  t3: string;
  t4: { label: string; value: string }[];
}

export interface TraceStep {
  t: number;
  layer: number;
  code: string;
  title: string;
  detail: string;
  json?: unknown;
}

export type GeoGeom =
  | { type: "Polygon"; coordinates: number[][][] }
  | { type: "MultiPolygon"; coordinates: number[][][][] }
  | { type: "LineString"; coordinates: number[][] }
  | { type: "Point"; coordinates: number[] };

export type GeoFeatureKind =
  | "flood"
  | "canopy_flood"
  | "road"
  | "subsidence"
  | "harvest"
  | "deforest"
  | "village"
  | "aoi"
  | "mangrove_loss"
  | "lake"
  | "hazard"
  | "flood_path"
  | "infrastructure"
  | "plume"
  | "hotspot"
  | "trajectory"
  | "station"
  | "mineral"
  | "core_target"
  | "fault"
  | "gsi_point"
  | (string & {});

export interface GeoFeature {
  type: "Feature";
  properties: {
    kind: GeoFeatureKind;
    name: string;
    value?: number;
    unit?: string;
    fill?: string;
  };
  geometry: GeoGeom;
}

export interface GeoCollection {
  type: "FeatureCollection";
  features: GeoFeature[];
}

export interface AnalysisResult {
  missionId?: MissionId;
  query: string;
  language: LangCode;
  translatedPrompt: string;
  agent: AgentId;
  secondaryAgents: AgentId[];
  latencyMs: number;
  physics: PhysicsSnapshot;
  manifold: number[];
  firewall: FirewallResult;
  geocp: GeoCPResult;
  report: TierReport;
  geojson: GeoCollection;
  answer: string;
  vqa: { question: string; answer: string; confidence: number };
  trace: TraceStep[];
  center: [number, number];
  zoom: number;
  swipeEnabled: boolean;
  mapMode: MapMode;
  beforeLabel?: string;
  afterLabel?: string;
  ndmaSop?: string;
}

export interface Mission {
  id: MissionId;
  code: string;
  title: string;
  region: string;
  problem: string;
  agent: AgentId;
  secondaryAgents: AgentId[];
  center: [number, number];
  zoom: number;
  samples: { lang: LangCode; text: string }[];
  landcover: Landcover;
  predictedClass: string;
  geojson: GeoCollection;
  report: TierReport;
  answer: string;
  vqa: { question: string; answer: string; confidence: number };
  geocp: GeoCPResult;
  swipeEnabled: boolean;
  mapMode: MapMode;
  beforeLabel?: string;
  afterLabel?: string;
  slopeOverride?: number;
  gsdM: number;
  ndmaSop?: string;
}

export type Landcover =
  | "floodplain"
  | "flood_canopy"
  | "mountain_town"
  | "ravine_agri"
  | "kuttanad"
  | "mangrove_delta"
  | "glacial_lake"
  | "urban_thermal"
  | "arid_mineral"
  | "generic";

export interface OpticalBands {
  blue: number;
  green: number;
  red: number;
  nir: number;
  swir1: number;
  swir2: number;
}
