import { ExternalLink } from "lucide-react";
import { AGENTS } from "@/lib/engine/agents";
import { useConsole } from "@/lib/store";
import { cn } from "@/lib/utils";

export function AgentRail() {
  const result = useConsole((s) => s.result);
  const running = useConsole((s) => s.running);
  const setSelectedAgentId = useConsole((s) => s.setSelectedAgentId);
  const active = new Set(result ? [result.agent, ...result.secondaryAgents] : []);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-3 pt-3">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Navagraha
        </p>
        <span className="font-mono text-[10px] text-muted-foreground/70">Click to inspect</span>
      </div>
      <ul className="flex flex-1 flex-col gap-1 overflow-auto p-2">
        {AGENTS.map((a) => {
          const on = active.has(a.id);
          const lead = result?.agent === a.id;
          return (
            <li key={a.id}>
              <button
                type="button"
                onClick={() => setSelectedAgentId(a.id)}
                className={cn(
                  "group w-full rounded-md border px-2.5 py-2 text-left transition-all duration-150",
                  lead
                    ? "border-sage/50 bg-sage/10 shadow-xs"
                    : on
                      ? "border-border bg-accent/80"
                      : "border-transparent hover:border-border hover:bg-secondary/60",
                )}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {lead && (
                      <span className="size-1.5 shrink-0 rounded-full bg-sage animate-ping" />
                    )}
                    <span className="truncate text-xs font-semibold text-foreground group-hover:text-sage">
                      {a.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="font-mono text-[11px] text-muted-foreground">{a.sanskrit}</span>
                    <ExternalLink className="size-3 opacity-0 text-sage transition-opacity group-hover:opacity-100" />
                  </div>
                </div>
                <p className="mt-0.5 text-xs leading-snug text-muted-foreground line-clamp-1">{a.domain}</p>
                {(lead || on) && (
                  <p className="mt-1 font-mono text-[11px] text-sage font-medium">{a.metric}</p>
                )}
              </button>
            </li>
          );
        })}
      </ul>
      {running && (
        <p className="border-t border-border px-3 py-2 font-mono text-xs text-sage animate-pulse">
          Routing specialist...
        </p>
      )}
    </div>
  );
}
