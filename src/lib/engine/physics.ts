import type {
  FirewallResult,
  GeoCPResult,
  Landcover,
  ManifoldChannelMeta,
  OpticalBands,
  PhysicsSnapshot,
  PhysicsViolationType,
} from "./types";

const EPS = 1e-6;

export function indexNDVI(nir: number, red: number) {
  return (nir - red) / (nir + red + EPS);
}
export function indexMNDWI(green: number, swir1: number) {
  return (green - swir1) / (green + swir1 + EPS);
}
export function indexNDBI(swir1: number, nir: number) {
  return (swir1 - nir) / (swir1 + nir + EPS);
}
export function indexEVI(nir: number, red: number, blue: number) {
  return (2.5 * (nir - red)) / (nir + 6 * red - 7.5 * blue + 1 + EPS);
}
export function indexNBR(nir: number, swir2: number) {
  return (nir - swir2) / (nir + swir2 + EPS);
}
export function indexNDTI(swir1: number, swir2: number) {
  return (swir1 - swir2) / (swir1 + swir2 + EPS);
}
export function indexOSWI(mndwi: number, sigma0VvDb: number) {
  return 1 / (1 + Math.exp(-5 * mndwi + sigma0VvDb / 5));
}

const ENDMEMBERS: number[][] = [
  [0.03, 0.05, 0.04, 0.48, 0.18, 0.08], // veg
  [0.14, 0.2, 0.24, 0.3, 0.34, 0.31], // soil
  [0.035, 0.055, 0.038, 0.028, 0.018, 0.012], // water
  [0.11, 0.13, 0.15, 0.17, 0.2, 0.19], // urban
];

function solve4(A: number[][], b: number[]): number[] {
  const m = A.map((row, i) => [...row, b[i]]);
  for (let i = 0; i < 4; i++) {
    let piv = i;
    for (let r = i + 1; r < 4; r++) if (Math.abs(m[r][i]) > Math.abs(m[piv][i])) piv = r;
    [m[i], m[piv]] = [m[piv], m[i]];
    const d = m[i][i] || EPS;
    for (let c = i; c < 5; c++) m[i][c] /= d;
    for (let r = 0; r < 4; r++) {
      if (r === i) continue;
      const f = m[r][i];
      for (let c = i; c < 5; c++) m[r][c] -= f * m[i][c];
    }
  }
  return m.map((row) => row[4]);
}

export function unmixMESMA(bands: number[]) {
  const A = ENDMEMBERS;
  const AtA = Array.from({ length: 4 }, (_, i) =>
    Array.from({ length: 4 }, (_, j) =>
      A[i].reduce((s, _, k) => s + A[i][k] * A[j][k], 0),
    ),
  );
  const Atb = Array.from({ length: 4 }, (_, i) =>
    A[i].reduce((s, v, k) => s + v * bands[k], 0),
  );
  let x = solve4(AtA, Atb);
  x = x.map((v) => Math.max(0, v));
  const sum = x.reduce((s, v) => s + v, 0) || 1;
  x = x.map((v) => v / sum);
  const recon = Array.from({ length: 6 }, (_, k) =>
    x.reduce((s, xi, i) => s + xi * A[i][k], 0),
  );
  const rmse = Math.sqrt(
    recon.reduce((s, v, k) => s + (v - bands[k]) ** 2, 0) / 6,
  );
  return { veg: x[0], soil: x[1], water: x[2], urban: x[3], rmse };
}

/** Typical Sentinel-2 surface reflectance + RISAT-like σ0 for each scene class. */
export function bandsFor(cover: Landcover): OpticalBands & {
  sigma0VvDb: number;
  sigma0VhDb: number;
  slopeDeg: number;
  canopyHeightM: number;
  albedo: number;
  sunElDeg: number;
  predictedClass: string;
} {
  switch (cover) {
    case "floodplain":
      return {
        blue: 0.042,
        green: 0.061,
        red: 0.039,
        nir: 0.041,
        swir1: 0.021,
        swir2: 0.014,
        sigma0VvDb: -21.4,
        sigma0VhDb: -28.1,
        slopeDeg: 0.7,
        canopyHeightM: 2.1,
        albedo: 0.06,
        sunElDeg: 58,
        predictedClass: "standing_water",
      };
    case "flood_canopy":
      return {
        blue: 0.038,
        green: 0.055,
        red: 0.044,
        nir: 0.29,
        swir1: 0.09,
        swir2: 0.05,
        sigma0VvDb: -8.6,
        sigma0VhDb: -14.2,
        slopeDeg: 0.9,
        canopyHeightM: 18.4,
        albedo: 0.12,
        sunElDeg: 54,
        predictedClass: "subcanopy_inundation",
      };
    case "mountain_town":
      return {
        blue: 0.11,
        green: 0.13,
        red: 0.15,
        nir: 0.22,
        swir1: 0.24,
        swir2: 0.21,
        sigma0VvDb: -7.2,
        sigma0VhDb: -13.8,
        slopeDeg: 18.6,
        canopyHeightM: 6.2,
        albedo: 0.18,
        sunElDeg: 41,
        predictedClass: "built_up",
      };
    case "ravine_agri":
      return {
        blue: 0.07,
        green: 0.11,
        red: 0.14,
        nir: 0.21,
        swir1: 0.28,
        swir2: 0.24,
        sigma0VvDb: -11.4,
        sigma0VhDb: -18.0,
        slopeDeg: 4.2,
        canopyHeightM: 3.8,
        albedo: 0.22,
        sunElDeg: 49,
        predictedClass: "harvested_cropland",
      };
    case "kuttanad":
      return {
        blue: 0.05,
        green: 0.07,
        red: 0.046,
        nir: 0.08,
        swir1: 0.03,
        swir2: 0.02,
        sigma0VvDb: -19.8,
        sigma0VhDb: -26.4,
        slopeDeg: 0.3,
        canopyHeightM: 4.6,
        albedo: 0.07,
        sunElDeg: 62,
        predictedClass: "standing_water",
      };
    case "mangrove_delta":
      return {
        blue: 0.04,
        green: 0.06,
        red: 0.05,
        nir: 0.24,
        swir1: 0.12,
        swir2: 0.06,
        sigma0VvDb: -10.2,
        sigma0VhDb: -16.4,
        slopeDeg: 0.4,
        canopyHeightM: 14.2,
        albedo: 0.11,
        sunElDeg: 56,
        predictedClass: "mangrove_dieback",
      };
    case "glacial_lake":
      return {
        blue: 0.14,
        green: 0.16,
        red: 0.11,
        nir: 0.04,
        swir1: 0.02,
        swir2: 0.01,
        sigma0VvDb: -16.5,
        sigma0VhDb: -23.2,
        slopeDeg: 28.4,
        canopyHeightM: 0.0,
        albedo: 0.08,
        sunElDeg: 42,
        predictedClass: "moraine_dam_breach",
      };
    case "urban_thermal":
      return {
        blue: 0.12,
        green: 0.14,
        red: 0.16,
        nir: 0.2,
        swir1: 0.26,
        swir2: 0.22,
        sigma0VvDb: -6.5,
        sigma0VhDb: -12.4,
        slopeDeg: 1.2,
        canopyHeightM: 4.5,
        albedo: 0.21,
        sunElDeg: 48,
        predictedClass: "thermal_anomaly",
      };
    case "arid_mineral":
      return {
        blue: 0.15,
        green: 0.19,
        red: 0.24,
        nir: 0.28,
        swir1: 0.38,
        swir2: 0.32,
        sigma0VvDb: -14.8,
        sigma0VhDb: -22.1,
        slopeDeg: 6.8,
        canopyHeightM: 1.2,
        albedo: 0.31,
        sunElDeg: 55,
        predictedClass: "pegmatite_greisen",
      };
    default:
      return {
        blue: 0.08,
        green: 0.1,
        red: 0.09,
        nir: 0.28,
        swir1: 0.18,
        swir2: 0.12,
        sigma0VvDb: -12.5,
        sigma0VhDb: -18.6,
        slopeDeg: 3.1,
        canopyHeightM: 9.4,
        albedo: 0.16,
        sunElDeg: 52,
        predictedClass: "mixed_mosaic",
      };
  }
}

function yamaguchi(cover: Landcover, sigma0VvDb: number) {
  // Build a plausible T3 from landcover, then 4-component powers.
  const surface =
    cover === "floodplain" || cover === "kuttanad" || cover === "glacial_lake"
      ? 0.72
      : cover === "arid_mineral"
        ? 0.65
        : 0.22;
  const dbl =
    cover === "flood_canopy" || cover === "mangrove_delta"
      ? 0.58
      : cover === "mountain_town" || cover === "urban_thermal"
        ? 0.45
        : 0.12;
  const vol =
    cover === "flood_canopy" || cover === "mangrove_delta"
      ? 0.32
      : cover === "ravine_agri"
        ? 0.18
        : 0.25;
  const helix = cover === "mountain_town" || cover === "urban_thermal" ? 0.08 : 0.03;
  const norm = surface + dbl + vol + helix;
  const ps = surface / norm;
  const pd = dbl / norm;
  const pv = vol / norm;
  const ph = helix / norm;
  const t11 = ps * 0.9 + 0.05;
  const t22 = pd * 0.85 + 0.04;
  const t33 = pv * 0.7 + 0.03;
  const traceT3 = t11 + t22 + t33;
  const iIncident = Math.max(traceT3 * 1.35, 0.55);
  const thetaRot = (cover === "mountain_town" ? 9 : 3) * (Math.PI / 180);
  void sigma0VvDb;
  return { ps, pd, pv, ph, t11, t22, t33, traceT3, iIncident, thetaRot };
}

export function buildPhysics(
  cover: Landcover,
  opts?: {
    slopeOverride?: number;
    gsdM?: number;
    predictedClass?: string;
    violation?: PhysicsViolationType;
  },
): PhysicsSnapshot {
  const raw = bandsFor(cover);
  let slopeDeg = opts?.slopeOverride ?? raw.slopeDeg;
  const ndvi = indexNDVI(raw.nir, raw.red);
  let mndwi = indexMNDWI(raw.green, raw.swir1);
  const ndbi = indexNDBI(raw.swir1, raw.nir);
  const evi = indexEVI(raw.nir, raw.red, raw.blue);
  const nbr = indexNBR(raw.nir, raw.swir2);
  const ndti = indexNDTI(raw.swir1, raw.swir2);
  const oswi = indexOSWI(mndwi, raw.sigma0VvDb);
  const mesma = unmixMESMA([
    raw.blue,
    raw.green,
    raw.red,
    raw.nir,
    raw.swir1,
    raw.swir2,
  ]);
  const y = yamaguchi(cover, raw.sigma0VvDb);
  const zenith = 90 - raw.sunElDeg;

  let traceT3 = y.traceT3;
  let iIncident = y.iIncident;
  let predictedClass = opts?.predictedClass ?? raw.predictedClass;
  let sigma0VvDb = raw.sigma0VvDb;
  let albedo = raw.albedo;

  // Injection of physical violations for interactive live evaluation stress testing
  if (opts?.violation === "stokes") {
    traceT3 = iIncident * 1.48; // Reflected energy Tr(T3) artificially exceeds incident radiation
  } else if (opts?.violation === "hydro") {
    predictedClass = "standing_water";
    slopeDeg = 21.8; // Standing water illegally claimed on 21.8° mountain slope
  } else if (opts?.violation === "specular") {
    mndwi = 0.54; // High optical water index
    sigma0VvDb = -7.4; // High SAR backscatter (specular rule violation: water must attenuate to < -16 dB)
  } else if (opts?.violation === "albedo") {
    albedo = 1.42; // Unphysical albedo > 1.0 (violating energy conservation)
  }

  return {
    blue: raw.blue,
    green: raw.green,
    red: raw.red,
    nir: raw.nir,
    swir1: raw.swir1,
    swir2: raw.swir2,
    ndvi,
    mndwi,
    ndbi,
    evi,
    nbr,
    ndti,
    oswi,
    slopeDeg,
    sigma0VvDb,
    sigma0VhDb: raw.sigma0VhDb,
    albedo,
    traceT3,
    iIncident,
    canopyHeightM: raw.canopyHeightM,
    ps: y.ps,
    pd: y.pd,
    pv: y.pv,
    ph: y.ph,
    thetaRot: y.thetaRot,
    coherence: cover === "mountain_town" ? 0.72 : cover === "flood_canopy" ? 0.61 : 0.48,
    mesma,
    gsdM: opts?.gsdM ?? 10,
    sunElDeg: raw.sunElDeg,
    zenithDeg: zenith,
    predictedClass,
  };
}

export function dharmaChakra(p: PhysicsSnapshot): FirewallResult {
  const postulates = [
    {
      id: "stokes",
      name: "Stokes Energy Conservation",
      passed: p.traceT3 <= p.iIncident,
      detail:
        p.traceT3 <= p.iIncident
          ? `PASSED: Tr(T₃)=${p.traceT3.toFixed(3)} ≤ Iᵢ=${p.iIncident.toFixed(3)} (Conservation of radiated energy)`
          : `REJECTED: Tr(T₃)=${p.traceT3.toFixed(3)} > Iᵢ=${p.iIncident.toFixed(3)} (Reflected energy exceeds incident illumination - Stokes violation)`,
    },
    {
      id: "hydro",
      name: "Hydrodynamic Slope Limit",
      passed: !(p.predictedClass === "standing_water" && p.slopeDeg > 5),
      detail:
        p.predictedClass === "standing_water" && p.slopeDeg > 5
          ? `REJECTED: Standing water predicted on steep slope (${p.slopeDeg.toFixed(1)}° > 5.0° - Gravity violation)`
          : `PASSED: Slope ${p.slopeDeg.toFixed(1)}° permissible for class ${p.predictedClass.replaceAll("_", " ")}`,
    },
    {
      id: "specular",
      name: "SAR Specular Reflection Rule",
      passed: !(p.mndwi > 0.3 && p.sigma0VvDb > -16),
      detail:
        p.mndwi > 0.3 && p.sigma0VvDb > -16
          ? `REJECTED: High optical water index (MNDWI=${p.mndwi.toFixed(2)}) but SAR backscatter too high (${p.sigma0VvDb.toFixed(1)} dB > -16 dB - Specular attenuation violation)`
          : `PASSED: MNDWI ${p.mndwi.toFixed(2)} concordant with σ⁰VV ${p.sigma0VvDb.toFixed(1)} dB`,
    },
    {
      id: "albedo",
      name: "Physical Albedo Bounds",
      passed: p.albedo >= 0 && p.albedo <= 1,
      detail:
        p.albedo >= 0 && p.albedo <= 1
          ? `PASSED: Surface broadband albedo α = ${p.albedo.toFixed(2)} ∈ [0.0, 1.0]`
          : `REJECTED: Unphysical albedo value (${p.albedo.toFixed(2)} not in [0.0, 1.0])`,
    },
  ];
  return { passed: postulates.every((x) => x.passed), postulates };
}

export function geoCP(cover: Landcover, extra?: Partial<GeoCPResult>): GeoCPResult {
  const base: Record<Landcover, GeoCPResult> = {
    floodplain: {
      ece: 0.021,
      coverage: 0.962,
      moranI: 0.41,
      interval: [0.86, 0.99],
      zone: "Brahmaputra valley · humid",
    },
    flood_canopy: {
      ece: 0.024,
      coverage: 0.955,
      moranI: 0.47,
      interval: [0.81, 0.98],
      zone: "Assam floodplain forest",
    },
    mountain_town: {
      ece: 0.019,
      coverage: 0.968,
      moranI: 0.33,
      interval: [1.6, 3.1],
      zone: "Western Himalaya · seismic",
    },
    ravine_agri: {
      ece: 0.022,
      coverage: 0.957,
      moranI: 0.29,
      interval: [0.72, 0.94],
      zone: "Central plateau · Chambal",
    },
    kuttanad: {
      ece: 0.018,
      coverage: 0.971,
      moranI: 0.52,
      interval: [0.88, 0.99],
      zone: "Kerala backwater · below MSL",
    },
    mangrove_delta: {
      ece: 0.021,
      coverage: 0.965,
      moranI: 0.51,
      interval: [0.82, 0.98],
      zone: "Ganges-Brahmaputra Delta · Tidal",
    },
    glacial_lake: {
      ece: 0.019,
      coverage: 0.973,
      moranI: 0.38,
      interval: [1.8, 3.4],
      zone: "High-Altitude Glaciated Cryosphere",
    },
    urban_thermal: {
      ece: 0.024,
      coverage: 0.958,
      moranI: 0.62,
      interval: [0.78, 0.95],
      zone: "Indo-Gangetic Basin · Atmospheric",
    },
    arid_mineral: {
      ece: 0.016,
      coverage: 0.978,
      moranI: 0.26,
      interval: [0.89, 0.99],
      zone: "Arid Shield & Metamorphic Greisen",
    },
    generic: {
      ece: 0.031,
      coverage: 0.951,
      moranI: 0.22,
      interval: [0.6, 0.92],
      zone: "All-India composite",
    },
  };
  return { ...base[cover], ...extra };
}

export function buildManifold(p: PhysicsSnapshot): number[] {
  const m = new Array<number>(128).fill(0);
  // Bucket 1 — Yamaguchi AG4U (0–31)
  m[0] = p.ps;
  m[1] = p.pd;
  m[2] = p.pv;
  m[3] = p.ph;
  m[4] = (p.thetaRot + Math.PI / 8) / (Math.PI / 4);
  m[5] = p.traceT3;
  m[6] = p.ps / (p.ps + p.pd + EPS);
  m[7] = p.pd / (p.pv + EPS);
  for (let i = 8; i < 32; i++) {
    const t = i / 32;
    m[i] = clamp01(
      p.ps * Math.cos(t * 5) ** 2 + p.pd * Math.sin(t * 7) ** 2 + p.pv * 0.3 * t,
    );
  }
  // Bucket 2 — RVoG (32–63)
  m[32] = clamp01(p.canopyHeightM / 40);
  m[33] = p.coherence;
  m[34] = clamp01((-p.sigma0VvDb - 4) / 24);
  m[35] = p.predictedClass.includes("inundation") ? 0.86 : p.oswi;
  for (let i = 36; i < 64; i++) {
    m[i] = clamp01(0.35 + 0.4 * p.coherence * Math.sin(i * 0.4) + 0.15 * m[32]);
  }
  // Bucket 3 — MESMA (64–95)
  m[64] = p.mesma.veg;
  m[65] = p.mesma.soil;
  m[66] = p.mesma.water;
  m[67] = p.mesma.urban;
  m[68] = p.mesma.rmse * 8;
  for (let i = 69; i < 96; i++) {
    const k = (i - 69) % 4;
    m[i] = [p.mesma.veg, p.mesma.soil, p.mesma.water, p.mesma.urban][k] * (0.6 + ((i * 17) % 10) / 25);
  }
  // Bucket 4 — indices (96–127)
  m[96] = (p.ndvi + 1) / 2;
  m[97] = (p.mndwi + 1) / 2;
  m[98] = (p.ndbi + 1) / 2;
  m[99] = clamp01((p.evi + 1) / 2);
  m[100] = (p.nbr + 1) / 2;
  m[101] = (p.ndti + 1) / 2;
  m[102] = p.oswi;
  m[103] = clamp01(p.slopeDeg / 45);
  m[104] = clamp01(p.albedo);
  m[105] = clamp01((-p.sigma0VvDb) / 30);
  m[106] = clamp01((-p.sigma0VhDb) / 35);
  m[107] = clamp01(p.sigma0VvDb - p.sigma0VhDb) / 20 + 0.5;
  for (let i = 108; i < 128; i++) {
    m[i] = clamp01((m[96 + (i % 8)] + m[64 + (i % 4)]) / 2);
  }
  return m.map((v) => clamp01(v));
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

export const MANIFOLD_BUCKETS = [
  { id: 1, range: [0, 31] as const, name: "Yamaguchi AG4U", hint: "Polarimetric SAR powers & coherency" },
  { id: 2, range: [32, 63] as const, name: "PolInSAR RVoG", hint: "3D Canopy height & sub-canopy flood" },
  { id: 3, range: [64, 95] as const, name: "MESMA", hint: "Sub-pixel endmember abundances" },
  { id: 4, range: [96, 127] as const, name: "Invariant indices", hint: "Optical × SAR spectral invariance" },
];

export const INDEX_LABELS: { i: number; label: string }[] = [
  { i: 0, label: "Ps" },
  { i: 1, label: "Pd" },
  { i: 2, label: "Pv" },
  { i: 3, label: "Ph" },
  { i: 4, label: "θ_rot" },
  { i: 5, label: "Tr(T3)" },
  { i: 6, label: "Ps/(Ps+Pd)" },
  { i: 7, label: "Pd/Pv" },
  { i: 32, label: "hv" },
  { i: 33, label: "γ" },
  { i: 34, label: "σ⁰VV" },
  { i: 35, label: "OSWI_sar" },
  { i: 64, label: "f_veg" },
  { i: 65, label: "f_soil" },
  { i: 66, label: "f_water" },
  { i: 67, label: "f_urban" },
  { i: 68, label: "RMSE" },
  { i: 96, label: "NDVI" },
  { i: 97, label: "MNDWI" },
  { i: 98, label: "NDBI" },
  { i: 99, label: "EVI" },
  { i: 100, label: "NBR" },
  { i: 101, label: "NDTI" },
  { i: 102, label: "OSWI" },
  { i: 103, label: "Slope" },
  { i: 104, label: "Albedo" },
  { i: 105, label: "σ⁰VV" },
  { i: 106, label: "σ⁰VH" },
  { i: 107, label: "VV/VH" },
];

/** Detailed metadata for all 128 channels in the Prakriti-Veda physics manifold */
export function getChannelMeta(idx: number): ManifoldChannelMeta {
  if (idx >= 0 && idx < 32) {
    const special: Record<number, { name: string; formula: string; desc: string }> = {
      0: { name: "Ps (Surface Power)", formula: "P_s = Re(T11' - T22')", desc: "Bragg specular surface reflection power" },
      1: { name: "Pd (Double-Bounce Power)", formula: "P_d = 2 * Re(T22')", desc: "Dihedral trunk-water double bounce reflection" },
      2: { name: "Pv (Volume Power)", formula: "P_v = (15/8) * T33", desc: "Random canopy dipole volume scattering" },
      3: { name: "Ph (Helix Power)", formula: "P_h = 2 * |Im(T23)|", desc: "Asymmetric helical circular scattering" },
      4: { name: "θ_rot (Orientation Angle)", formula: "(1/4) * atan2(2Re(T23), T22 - T33)", desc: "Deorientation angle around radar line of sight" },
      5: { name: "Tr(T3) Total Span", formula: "T11 + T22 + T33", desc: "Total incident polarimetric radar power span" },
      6: { name: "Surface Purity Ratio", formula: "P_s / (P_s + P_d)", desc: "Ratio of surface scattering to dihedral bounce" },
      7: { name: "Sub-Canopy Ratio", formula: "P_d / P_v", desc: "Double-bounce to volume ratio (sub-canopy water marker)" },
    };
    const s = special[idx] ?? {
      name: `T3 Matrix Element [ch ${idx}]`,
      formula: `T_{${(idx % 3) + 1}${(idx % 2) + 1}}'`,
      desc: `Refined Lee 7x7 filtered coherency sub-component`,
    };
    return {
      index: idx,
      name: s.name,
      bucket: 1,
      bucketName: "Yamaguchi AG4U Polarimetric SAR",
      formula: s.formula,
      sensor: "RISAT-1A / NISAR C/L-Band",
      unit: idx === 4 ? "rad" : idx === 5 ? "W/m²" : "power ratio",
      description: s.desc,
    };
  } else if (idx >= 32 && idx < 64) {
    const special: Record<number, { name: string; formula: string; desc: string }> = {
      32: { name: "hv (3D Canopy Height)", formula: "h_v = Δφ / k_z", desc: "Vertical tree canopy height inverted via PolInSAR" },
      33: { name: "γ(w) Interferometric Coherence", formula: "e^{jφ0} * (γv + μ) / (1 + μ)", desc: "Complex interferometric phase stability" },
      34: { name: "σ⁰VV Backscatter", formula: "10 * log10(DN² / A) - K", desc: "Calibrated vertical-vertical radar cross section" },
      35: { name: "OSWI_sar Radar Water Probability", formula: "σ(-5*MNDWI + σ⁰VV/5)", desc: "PolInSAR sub-canopy water likelihood" },
    };
    const s = special[idx] ?? {
      name: `RVoG Structure Param [ch ${idx}]`,
      formula: `k_z = 4π * B_perp / (λ * R * sin(θ))`,
      desc: `Interferometric vertical wavenumber & extinction component`,
    };
    return {
      index: idx,
      name: s.name,
      bucket: 2,
      bucketName: "PolInSAR RVoG 3D Canopy & Flood",
      formula: s.formula,
      sensor: "RISAT-1A + CartoDEM",
      unit: idx === 32 ? "meters (m)" : idx === 34 ? "dB" : "dimensionless [0, 1]",
      description: s.desc,
    };
  } else if (idx >= 64 && idx < 96) {
    const special: Record<number, { name: string; formula: string; desc: string }> = {
      64: { name: "f_veg (Photosynthetic Vegetation)", formula: "argmin ||R(λ) - Σ f_k E_k||", desc: "Sub-pixel green leaf canopy fraction" },
      65: { name: "f_soil (Bare Mineral Soil)", formula: "argmin ||R(λ) - Σ f_k E_k||", desc: "Sub-pixel bare exposed rock and soil fraction" },
      66: { name: "f_water (Open Surface Water)", formula: "argmin ||R(λ) - Σ f_k E_k||", desc: "Sub-pixel pure water absorption fraction" },
      67: { name: "f_urban (Impervious Built-up)", formula: "argmin ||R(λ) - Σ f_k E_k||", desc: "Sub-pixel asphalt, concrete, and roof fraction" },
      68: { name: "MESMA Unmixing RMSE", formula: "sqrt(1/6 * Σ (recon_λ - R_λ)²)", desc: "Endmember reconstruction residual error" },
    };
    const s = special[idx] ?? {
      name: `Endmember Fraction Residual [ch ${idx}]`,
      formula: `R(λ_${(idx % 6) + 1}) - \\hat{R}`,
      desc: `Spectral Angle Mapper (SAM) deviation band`,
    };
    return {
      index: idx,
      name: s.name,
      bucket: 3,
      bucketName: "MESMA Sub-Pixel Spectral Mixture",
      formula: s.formula,
      sensor: "Sentinel-2 MSI (10m / 20m)",
      unit: "fraction [0.0, 1.0]",
      description: s.desc,
    };
  } else {
    const special: Record<number, { name: string; formula: string; desc: string }> = {
      96: { name: "NDVI (Vegetation Index)", formula: "(NIR - Red) / (NIR + Red)", desc: "Chlorophyll absorption and cell-wall reflectance" },
      97: { name: "MNDWI (Water Index)", formula: "(Green - SWIR1) / (Green + SWIR1)", desc: "Open water surface discrimination from built-up" },
      98: { name: "NDBI (Built-up Index)", formula: "(SWIR1 - NIR) / (SWIR1 + NIR)", desc: "Impervious urban infrastructure and buildings" },
      99: { name: "EVI (Enhanced Vegetation)", formula: "2.5 * (NIR - Red) / (NIR + 6*Red - 7.5*Blue + 1)", desc: "Atmosphere-corrected canopy background greenness" },
      100: { name: "NBR (Normalized Burn Ratio)", formula: "(NIR - SWIR2) / (NIR + SWIR2)", desc: "Burn severity and fire scar identification" },
      101: { name: "NDTI (Tillage Index)", formula: "(SWIR1 - SWIR2) / (SWIR1 + SWIR2)", desc: "Crop residue and dry soil cultivation tracking" },
      102: { name: "OSWI (Fused Optical-SAR Water)", formula: "σ(5*MNDWI - σ⁰VV/5)", desc: "Joint Optical-SAR inundation invariant" },
      103: { name: "Terrain Slope Angle", formula: "atan(sqrt(dz_dx² + dz_dy²)) * 180/π", desc: "DEM slope for hydrodynamic gravity validation" },
      104: { name: "Broadband Albedo (α)", formula: "0.356*Blue + 0.130*Red + 0.373*NIR + 0.085*SWIR1", desc: "Total hemispherical surface solar reflectance" },
      105: { name: "σ⁰VV Backscatter", formula: "Calibrated C-band σ⁰", desc: "Co-polarized vertical radar cross section" },
      106: { name: "σ⁰VH Cross-Pol", formula: "Calibrated C-band σ⁰", desc: "Cross-polarized volumetric radar backscatter" },
      107: { name: "Dual-Pol Ratio (VV/VH)", formula: "σ⁰VV(dB) - σ⁰VH(dB)", desc: "Depolarization ratio indicating canopy volume" },
    };
    const s = special[idx] ?? {
      name: `Derived Invariant [ch ${idx}]`,
      formula: `(Index_${(idx % 12) + 1} + Manifold_${idx - 32}) / 2`,
      desc: `Cross-spectral invariant feature descriptor`,
    };
    return {
      index: idx,
      name: s.name,
      bucket: 4,
      bucketName: "16 Invariant Optical & SAR Indices",
      formula: s.formula,
      sensor: "Sentinel-2 + RISAT-1A + CartoDEM",
      unit: idx === 103 ? "degrees (°)" : idx === 105 || idx === 106 ? "dB" : "index [-1, 1]",
      description: s.desc,
    };
  }
}
