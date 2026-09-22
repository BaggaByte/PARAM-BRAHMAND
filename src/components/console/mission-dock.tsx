import { Radar } from "lucide-react";
import { MISSIONS } from "@/lib/engine/missions";
import { useConsole } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { MissionId } from "@/lib/engine/types";

const MISSION_CAT: Record<MissionId, { label: string; color: string }> = {
  kaziranga:         { label: "Flood",      color: "#5b9aa0" },
  kuttanad:          { label: "Flood",      color: "#3b82f6" },
  joshimath:         { label: "Subsidence", color: "#c45c4a" },
  lhonak_glof:       { label: "GLOF",       color: "#60a5fa" },
  chambal:           { label: "Forest",     color: "#6b8f71" },
  sundarbans:        { label: "Mangrove",   color: "#4a7c59" },
  delhi_thermal:     { label: "Thermal",    color: "#f97316" },
  rajasthan_mineral: { label: "Mineral",    color: "#eab308" },
};

export function MissionDock() {
  const loadMission = useConsole((s) => s.loadMission);
  const running = useConsole((s) => s.running);
  const active = useConsole((s) => s.result?.missionId);
  const dualSarDemoOpen = useConsole((s) => s.dualSarDemoOpen);
  const setDualSarDemoOpen = useConsole((s) => s.setDualSarDemoOpen);

  return (
    <div className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {/* Live Jury Dual SAR Demo — always first for pitch visibility */}
      <button
        type="button"
        disabled={running}
        onClick={() => setDualSarDemoOpen(true)}
        className={cn(
          "shrink-0 rounded-md border px-3 py-2 text-left transition-colors duration-150",
          dualSarDemoOpen
            ? "border-teal-500/60 bg-teal-500/15 shadow-sm shadow-teal-500/10"
            : "border-border bg-card hover:bg-accent",
        )}
        title="Open live Optical vs Kaal-Radar dual comparison (Kaziranga KS-FL-07)"
      >
        <span className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
          <Radar className="size-3.5 text-teal-400" />
          <span className="text-teal-400/90">KS-FL-07</span>
          <span className="text-muted-foreground/50">Dual Demo</span>
        </span>
        <span className="mt-0.5 block text-xs font-medium text-foreground">
          Kaal-Radar Dual View
        </span>
        <span className="block text-xs text-muted-foreground">Optical ↔ SAR live</span>
      </button>

      {MISSIONS.map((m) => {
        const cat = MISSION_CAT[m.id];
        return (
          <button
            key={m.id}
            type="button"
            disabled={running}
            onClick={() => {
              setDualSarDemoOpen(false);
              void loadMission(m.id);
            }}
            className={cn(
              "shrink-0 rounded-md border px-3 py-2 text-left transition-colors duration-150",
              !dualSarDemoOpen && active === m.id
                ? "border-sage/50 bg-sage/10"
                : "border-border bg-card hover:bg-accent",
            )}
          >
            <span className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
              <span
                className="mission-cat-dot"
                style={{ backgroundColor: cat.color }}
                aria-label={cat.label}
              />
              {m.code}
              <span className="text-muted-foreground/50">{cat.label}</span>
            </span>
            <span className="mt-0.5 block text-xs font-medium text-foreground">{m.title}</span>
            <span className="block text-xs text-muted-foreground">{m.region}</span>
          </button>
        );
      })}
    </div>
  );
}
