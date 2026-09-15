import { Info } from "lucide-react";
import { LAYERS } from "@/lib/engine/agents";
import { useConsole } from "@/lib/store";
import { cn } from "@/lib/utils";

export function LayerStack() {
  const activeLayer = useConsole((s) => s.activeLayer);
  const result = useConsole((s) => s.result);
  const running = useConsole((s) => s.running);
  const setSelectedLayerId = useConsole((s) => s.setSelectedLayerId);
  const doneIds = new Set(result && !running ? LAYERS.map((l) => l.id) : []);

  return (
    <div className="border-t border-border">
      <div className="flex items-center justify-between px-3 pt-3">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Seven layers
        </p>
        <span className="font-mono text-[10px] text-muted-foreground/70">Click to inspect</span>
      </div>
      <ol className="space-y-1 p-2 pb-3">
        {LAYERS.map((l) => {
          const live = activeLayer === l.id;
          const done =
            doneIds.has(l.id) ||
            (running &&
              activeLayer !== null &&
              LAYERS.find((x) => x.id === activeLayer)!.order > l.order);
          return (
            <li key={l.id}>
              <button
                type="button"
                onClick={() => setSelectedLayerId(l.id)}
                className={cn(
                  "group flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left transition-colors duration-150",
                  live
                    ? "bg-sage/15 border border-sage/40"
                    : "border border-transparent hover:border-border hover:bg-secondary/60",
                )}
              >
                <span
                  className={cn(
                    "mt-1 size-2 shrink-0 rounded-full transition-colors",
                    live && "bg-sage pb-pip animate-pulse",
                    done && !live && "bg-sage",
                    !done && !live && "bg-border",
                  )}
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-1">
                    <span className="truncate text-xs font-semibold text-foreground group-hover:text-sage">
                      {l.name}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="font-mono text-[11px] text-muted-foreground">{l.code}</span>
                      <Info className="size-3 opacity-0 text-sage transition-opacity group-hover:opacity-100" />
                    </div>
                  </span>
                  <span className="block truncate text-[11px] text-muted-foreground">{l.role}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
