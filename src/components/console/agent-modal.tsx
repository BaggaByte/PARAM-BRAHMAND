import * as Dialog from "@radix-ui/react-dialog";
import { ArrowRight, Cpu, Satellite, Sparkles, X } from "lucide-react";
import { AGENT_BY_ID, AGENTS } from "@/lib/engine/agents";
import { useConsole } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function AgentModal() {
  const selectedId = useConsole((s) => s.selectedAgentId);
  const setSelectedId = useConsole((s) => s.setSelectedAgentId);
  const submit = useConsole((s) => s.submit);
  const setQuery = useConsole((s) => s.setQuery);

  const agent = selectedId ? AGENT_BY_ID[selectedId] : null;

  function runSample(q: string) {
    setQuery(q);
    setSelectedId(null);
    void submit(q);
  }

  return (
    <Dialog.Root
      open={selectedId !== null}
      onOpenChange={(open) => {
        if (!open) setSelectedId(null);
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[2000] bg-background/85 backdrop-blur-xs" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[2001] max-h-[min(42rem,92dvh)] w-[min(44rem,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-xl border border-border bg-card p-5 text-card-foreground shadow-2xl">
          {agent && (
            <div className="space-y-5">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 pr-8">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-sage">{agent.sanskrit}</span>
                    <Dialog.Title className="font-display text-xl font-bold tracking-tight">
                      {agent.name}
                    </Dialog.Title>
                    <Badge variant="outline" className="border-sage/40 text-sage">
                      Navagraha Engine
                    </Badge>
                  </div>
                  <Dialog.Description className="mt-1 text-sm font-medium text-foreground">
                    {agent.domain}
                  </Dialog.Description>
                </div>
              </div>

              {/* Description */}
              <div className="rounded-lg border border-border/80 bg-secondary/60 p-3.5 text-sm leading-relaxed text-muted-foreground">
                {agent.description}
              </div>

              {/* Core Mechanism & Mathematics */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground">
                  <Cpu className="size-3.5 text-sage" />
                  <span>Mathematical Formulation & Under-the-Hood Mechanism</span>
                </div>
                <div className="rounded-md border border-border bg-background p-3 font-mono text-xs text-foreground">
                  <div className="text-muted-foreground text-[11px] mb-1">Mechanism: {agent.mechanism}</div>
                  <div className="overflow-x-auto py-1 text-sage font-medium tracking-wide">
                    {agent.mathematics}
                  </div>
                </div>
              </div>

              {/* Sensors Used */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground">
                  <Satellite className="size-3.5 text-sage" />
                  <span>Constellation Sensor Ingestion</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {agent.sensors.map((s) => (
                    <span
                      key={s}
                      className="rounded-md border border-border bg-secondary px-2.5 py-1 font-mono text-xs text-foreground"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Benchmarks Matrix */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground">
                  <Sparkles className="size-3.5 text-sage" />
                  <span>SOTA Benchmark Evaluation (2026)</span>
                </div>
                <div className="overflow-hidden rounded-md border border-border bg-background">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-border bg-secondary/50 font-mono text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2 font-medium">Dataset</th>
                        <th className="px-3 py-2 font-medium">Metric</th>
                        <th className="px-3 py-2 font-medium">SOTA Baseline</th>
                        <th className="px-3 py-2 font-medium text-sage">PARAM-BRAHMAND</th>
                        <th className="px-3 py-2 font-medium text-sage">Delta</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 font-mono">
                      {agent.benchmarks.map((b) => (
                        <tr key={b.dataset + b.metric} className="hover:bg-secondary/30">
                          <td className="px-3 py-2 font-sans font-medium text-foreground">{b.dataset}</td>
                          <td className="px-3 py-2 text-muted-foreground">{b.metric}</td>
                          <td className="px-3 py-2 text-muted-foreground">{b.sota}</td>
                          <td className="px-3 py-2 font-bold text-sage">{b.ours}</td>
                          <td className="px-3 py-2 font-semibold text-emerald-400">{b.delta}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Footer */}
              <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-mono text-xs text-muted-foreground">
                  Primary Benchmark: <span className="text-sage">{agent.metric}</span>
                </p>
                <Button
                  onClick={() => runSample(agent.sampleQuery)}
                  className="gap-2 bg-sage text-background hover:bg-sage/90"
                >
                  <span>Test Agent Query</span>
                  <ArrowRight className="size-4" />
                </Button>
              </div>

              {/* Switch to other agents */}
              <div className="border-t border-border pt-3">
                <p className="mb-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  Switch Specialist
                </p>
                <div className="flex flex-wrap gap-1">
                  {AGENTS.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => setSelectedId(a.id)}
                      className={`rounded-sm px-2 py-1 font-mono text-xs transition-colors ${
                        a.id === agent.id
                          ? "bg-sage text-background font-semibold"
                          : "bg-secondary text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {a.name}
                    </button>
                  ))}
                </div>
              </div>

              <Dialog.Close className="absolute right-3.5 top-3.5 rounded-sm p-1 text-muted-foreground transition-colors hover:text-foreground">
                <X className="size-4" />
                <span className="sr-only">Close</span>
              </Dialog.Close>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
