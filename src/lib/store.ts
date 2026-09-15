import { create } from "zustand";
import { MISSIONS } from "@/lib/engine/missions";
import { runPipeline } from "@/lib/engine/pipeline";
import type {
  AgentId,
  AnalysisResult,
  LangCode,
  MapMode,
  MissionId,
  PhysicsViolationType,
  SarDisplayMode,
  TraceStep,
} from "@/lib/engine/types";

export type RightTab = "report" | "trace" | "manifold" | "firewall";
export type MobileSheet = "agents" | "report" | "missions" | null;

interface ConsoleState {
  booted: boolean;
  setBooted: (v: boolean) => void;
  language: LangCode;
  setLanguage: (l: LangCode) => void;
  query: string;
  setQuery: (q: string) => void;
  running: boolean;
  activeLayer: number | null;
  liveTrace: TraceStep[];
  result: AnalysisResult | null;
  mapMode: MapMode;
  setMapMode: (m: MapMode) => void;
  sarDisplayMode: SarDisplayMode;
  setSarDisplayMode: (m: SarDisplayMode) => void;
  swipe: number;
  setSwipe: (n: number) => void;
  rightTab: RightTab;
  setRightTab: (t: RightTab) => void;
  mobileSheet: MobileSheet;
  setMobileSheet: (s: MobileSheet) => void;
  flyNonce: number;
  aboutOpen: boolean;
  setAboutOpen: (v: boolean) => void;
  selectedAgentId: AgentId | null;
  setSelectedAgentId: (id: AgentId | null) => void;
  selectedLayerId: number | null;
  setSelectedLayerId: (id: number | null) => void;
  physicsViolation: PhysicsViolationType;
  setPhysicsViolation: (v: PhysicsViolationType) => void;
  center: [number, number];
  zoom: number;
  setView: (center: [number, number], zoom: number) => void;
  cursorCoords: { lat: number; lng: number; elev: number } | null;
  setCursorCoords: (coords: { lat: number; lng: number; elev: number } | null) => void;
  isSpeaking: boolean;
  setIsSpeaking: (v: boolean) => void;
  submit: (text?: string, violationOverride?: PhysicsViolationType) => Promise<void>;
  loadMission: (id: MissionId) => Promise<void>;
  reset: () => void;
}

const INDIA: [number, number] = [22.97, 78.66];

export const useConsole = create<ConsoleState>((set, get) => ({
  booted: false,
  setBooted: (v) => set({ booted: v }),
  language: "en",
  setLanguage: (l) => set({ language: l }),
  query: "",
  setQuery: (q) => set({ query: q }),
  running: false,
  activeLayer: null,
  liveTrace: [],
  result: null,
  mapMode: "optical",
  setMapMode: (m) => set({ mapMode: m }),
  sarDisplayMode: "intensity",
  setSarDisplayMode: (m) => set({ sarDisplayMode: m }),
  swipe: 52,
  setSwipe: (n) => set({ swipe: n }),
  rightTab: "report",
  setRightTab: (t) => set({ rightTab: t }),
  mobileSheet: null,
  setMobileSheet: (s) => set({ mobileSheet: s }),
  flyNonce: 0,
  aboutOpen: false,
  setAboutOpen: (v) => set({ aboutOpen: v }),
  selectedAgentId: null,
  setSelectedAgentId: (id) => set({ selectedAgentId: id }),
  selectedLayerId: null,
  setSelectedLayerId: (id) => set({ selectedLayerId: id }),
  physicsViolation: "none",
  setPhysicsViolation: (v) => set({ physicsViolation: v }),
  center: INDIA,
  zoom: 5,
  setView: (center, zoom) => set({ center, zoom }),
  cursorCoords: null,
  setCursorCoords: (coords) => set({ cursorCoords: coords }),
  isSpeaking: false,
  setIsSpeaking: (v) => set({ isSpeaking: v }),
  reset: () =>
    set({
      result: null,
      liveTrace: [],
      activeLayer: null,
      running: false,
      center: INDIA,
      zoom: 5,
      flyNonce: get().flyNonce + 1,
      mapMode: "optical",
      sarDisplayMode: "intensity",
      physicsViolation: "none",
      query: "",
      cursorCoords: null,
      isSpeaking: false,
    }),
  submit: async (text, violationOverride) => {
    const q = (text ?? get().query).trim();
    if (!q || get().running) return;
    const violation = violationOverride ?? get().physicsViolation;
    set({
      query: q,
      running: true,
      liveTrace: [],
      activeLayer: null,
      result: null,
      rightTab: "trace",
    });
    try {
      const result = await runPipeline(
        {
          query: q,
          language: get().language,
          center: get().center,
          zoom: get().zoom,
          violation,
        },
        (step, activeLayer) => {
          set((s) => ({ liveTrace: [...s.liveTrace, step], activeLayer }));
        },
      );
      set({
        result,
        running: false,
        activeLayer: null,
        mapMode: result.mapMode,
        center: result.center,
        zoom: result.zoom,
        flyNonce: get().flyNonce + 1,
        rightTab: violation !== "none" ? "firewall" : "report",
        swipe: 52,
      });
      persistQuery(q);
    } catch {
      set({ running: false, activeLayer: null });
    }
  },
  loadMission: async (id: MissionId) => {
    const m = MISSIONS.find((x) => x.id === id);
    if (!m) return;
    const sample =
      m.samples.find((s) => s.lang === get().language)?.text ?? m.samples[0].text;
    set({ query: sample });
    await get().submit(sample);
  },
}));

function persistQuery(q: string) {
  try {
    const prev = JSON.parse(localStorage.getItem("pb.queries") || "[]") as string[];
    const next = [q, ...prev.filter((x) => x !== q)].slice(0, 8);
    localStorage.setItem("pb.queries", JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function recentQueries(): string[] {
  try {
    return JSON.parse(localStorage.getItem("pb.queries") || "[]") as string[];
  } catch {
    return [];
  }
}

export { MISSIONS };
