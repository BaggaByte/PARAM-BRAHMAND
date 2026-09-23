import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, 
  Loader2,
  ServerCog
} from "lucide-react";
import { useConsole } from "@/lib/store";
import { Badge } from "@/components/ui/badge";

export function LiveProcessingViz() {
  const running = useConsole((s) => s.running);
  const liveTrace = useConsole((s) => s.liveTrace);
  const activeLayer = useConsole((s) => s.activeLayer);

  // If not running and no trace, hide entirely.
  if (!running && liveTrace.length === 0) return null;

  const progressPercent = Math.min(Math.round((liveTrace.length / 7) * 100), 100);

  return (
    <AnimatePresence>
      {(running || (liveTrace.length > 0 && progressPercent < 100)) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="fixed bottom-40 left-1/2 -translate-x-1/2 z-[8000] w-full max-w-md pointer-events-none"
        >
          <div className="rounded-3xl border border-primary/40 bg-background/80 backdrop-blur-2xl p-6 shadow-2xl glass-morphism">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Loader2 className="size-5 animate-spin text-primary" />
                <span className="font-semibold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Executing Pipeline...
                </span>
              </div>
              <Badge variant="outline" className="border-primary/40 text-primary text-xs font-mono">
                {progressPercent}%
              </Badge>
            </div>

            {/* Current Stage Highlight */}
            {liveTrace.length > 0 && (
              <motion.div
                key={liveTrace.length}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-4 rounded-2xl bg-primary/10 border border-primary/20 p-4 shadow-inner"
              >
                <div className="flex items-start gap-3">
                  <div className="text-primary animate-pulse mt-1">
                    <ServerCog className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-base text-foreground mb-1">
                      {liveTrace[liveTrace.length - 1].title}
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed break-words">
                      {liveTrace[liveTrace.length - 1].detail}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Progress List */}
            <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {liveTrace.map((step, index) => {
                const isCurrent = index === liveTrace.length - 1;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className={`flex flex-col text-sm ${
                      isCurrent
                        ? "text-primary font-medium"
                        : "text-muted-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {!isCurrent ? (
                        <CheckCircle2 className="size-4 text-primary shrink-0" />
                      ) : (
                        <Loader2 className="size-4 animate-spin text-primary shrink-0" />
                      )}
                      <span className="truncate font-semibold">Layer {step.layer}: {step.title}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Tech Stack Badge */}
            <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
              <span>7-Layer Param-Brahmand Core</span>
              <span className="font-mono text-primary animate-pulse">Running live</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
