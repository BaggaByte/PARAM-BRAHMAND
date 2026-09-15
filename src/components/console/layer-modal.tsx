import * as Dialog from "@radix-ui/react-dialog";
import { Cpu, Layers, ShieldCheck, X, Zap } from "lucide-react";
import { LAYERS } from "@/lib/engine/agents";
import { useConsole } from "@/lib/store";
import { Badge } from "@/components/ui/badge";

export function LayerModal() {
  const selectedLayerId = useConsole((s) => s.selectedLayerId);
  const setSelectedLayerId = useConsole((s) => s.setSelectedLayerId);

  const layer = selectedLayerId ? LAYERS.find((l) => l.id === selectedLayerId) : null;

  return (
    <Dialog.Root
      open={selectedLayerId !== null}
      onOpenChange={(open) => {
        if (!open) setSelectedLayerId(null);
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[2000] bg-background/85 backdrop-blur-xs" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[2001] max-h-[min(42rem,92dvh)] w-[min(44rem,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-xl border border-border bg-card p-5 text-card-foreground shadow-2xl">
          {layer && (
            <div className="space-y-5">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 pr-8">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="border-sage text-sage font-mono">
                      {layer.code}
                    </Badge>
                    <span className="font-mono text-sm font-semibold text-sage">{layer.sanskrit}</span>
                    <Dialog.Title className="font-display text-xl font-bold tracking-tight">
                      {layer.name}
                    </Dialog.Title>
                  </div>
                  <Dialog.Description className="mt-1 text-sm font-medium text-foreground">
                    {layer.fullTitle}
                  </Dialog.Description>
                </div>
              </div>

              {/* Role & Position in 7-Layer OS */}
              <div className="rounded-lg border border-border/80 bg-secondary/60 p-3.5 text-sm leading-relaxed text-muted-foreground">
                <span className="font-medium text-foreground">Operational Role: </span>
                {layer.role}
              </div>

              {/* Tensor Contract */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground">
                  <Layers className="size-3.5 text-sage" />
                  <span>Tensor Input / Output Interface Contract</span>
                </div>
                <div className="rounded-md border border-border bg-background p-3 font-mono text-xs text-sage font-medium">
                  {layer.tensorContract}
                </div>
              </div>

              {/* Mathematical Foundations & Physical Conservation Laws */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground">
                  <Cpu className="size-3.5 text-sage" />
                  <span>Deterministic Physical Equations & Formulations</span>
                </div>
                <div className="space-y-1.5 rounded-md border border-border bg-background p-3 font-mono text-xs">
                  {layer.equations.map((eq, i) => (
                    <div key={i} className="rounded-sm bg-secondary/40 p-2 text-foreground overflow-x-auto">
                      {eq}
                    </div>
                  ))}
                </div>
              </div>

              {/* Hardware Performance & Latency Specs */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground">
                  <Zap className="size-3.5 text-sage" />
                  <span>Hardware Execution & Benchmark Profile</span>
                </div>
                <div className="flex items-center gap-2 rounded-md border border-border bg-secondary/40 px-3 py-2 font-mono text-xs text-muted-foreground">
                  <ShieldCheck className="size-4 text-sage shrink-0" />
                  <span>{layer.hardwareSpecs}</span>
                </div>
              </div>

              {/* 7-Layer Pipeline Navigation */}
              <div className="border-t border-border pt-3">
                <p className="mb-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  7-Layer Architecture Stack
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {LAYERS.map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => setSelectedLayerId(l.id)}
                      className={`flex items-center justify-between rounded-md border p-2 text-left transition-colors ${
                        l.id === layer.id
                          ? "border-sage bg-sage/10 text-foreground"
                          : "border-border bg-secondary text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span className="font-mono text-xs font-bold text-sage">{l.code}</span>
                      <span className="truncate text-xs font-medium">{l.name.split(" ")[0]}</span>
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
