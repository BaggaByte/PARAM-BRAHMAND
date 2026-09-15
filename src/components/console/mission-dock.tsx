import { MISSIONS, useConsole } from "@/lib/store";
import { cn } from "@/lib/utils";

export function MissionDock() {
  const loadMission = useConsole((s) => s.loadMission);
  const running = useConsole((s) => s.running);
  const active = useConsole((s) => s.result?.missionId);

  return (
    <div className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {MISSIONS.map((m) => (
        <button
          key={m.id}
          type="button"
          disabled={running}
          onClick={() => loadMission(m.id)}
          className={cn(
            "shrink-0 rounded-md border px-3 py-2 text-left transition-colors duration-150",
            active === m.id
              ? "border-sage/50 bg-sage/10"
              : "border-border bg-card hover:bg-accent",
          )}
        >
          <span className="block font-mono text-xs text-muted-foreground">{m.code}</span>
          <span className="block text-xs font-medium text-foreground">{m.title}</span>
          <span className="block text-xs text-muted-foreground">{m.region}</span>
        </button>
      ))}
    </div>
  );
}
