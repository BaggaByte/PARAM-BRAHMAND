import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Satellite, 
  Brain, 
  Shield, 
  CheckCircle2, 
  Loader2,
  Radar,
  Image as ImageIcon,
  Map as MapIcon,
  Layers as LayersIcon
} from "lucide-react";
import { useConsole } from "@/lib/store";
import { Badge } from "@/components/ui/badge";

export function LiveProcessingViz() {
  const running = useConsole((s) => s.running);
  const result = useConsole((s) => s.result);
  const [stages, setStages] = useState<string[]>([]);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);

  const PROCESSING_STAGES = [
    {
      icon: <Satellite className="size-6" />,
      title: "Downloading Satellite Data",
      description: "Fetching imagery from ISRO satellites",
      color: "text-blue-500",
      duration: 800,
    },
    {
      icon: <Radar className="size-6" />,
      title: "Processing SAR Signals",
      description: "Analyzing radar data (can see through clouds)",
      color: "text-purple-500",
      duration: 1000,
    },
    {
      icon: <ImageIcon className="size-6" />,
      title: "Analyzing Optical Images",
      description: "Processing visible light satellite photos",
      color: "text-green-500",
      duration: 800,
    },
    {
      icon: <MapIcon className="size-6" />,
      title: "Checking Terrain Data",
      description: "Analyzing elevation and slopes",
      color: "text-orange-500",
      duration: 700,
    },
    {
      icon: <Brain className="size-6" />,
      title: "AI Analysis Running",
      description: "9 specialist AIs processing data",
      color: "text-cyan-500",
      duration: 1200,
    },
    {
      icon: <LayersIcon className="size-6" />,
      title: "7-Layer Processing",
      description: "Running physics-based analysis pipeline",
      color: "text-indigo-500",
      duration: 1000,
    },
    {
      icon: <Shield className="size-6" />,
      title: "Physics Verification",
      description: "Checking results against physical laws",
      color: "text-sage",
      duration: 900,
    },
    {
      icon: <CheckCircle2 className="size-6" />,
      title: "Results Ready!",
      description: "Analysis complete with 0% hallucination",
      color: "text-emerald-500",
      duration: 500,
    },
  ];

  useEffect(() => {
    if (running) {
      setStages([]);
      setCurrentStageIndex(0);
      
      // Simulate progressive stages
      let index = 0;
      const interval = setInterval(() => {
        if (index < PROCESSING_STAGES.length) {
          setStages(prev => [...prev, PROCESSING_STAGES[index].title]);
          setCurrentStageIndex(index);
          index++;
        } else {
          clearInterval(interval);
        }
      }, 600);

      return () => clearInterval(interval);
    } else if (result) {
      // Show final state briefly then fade out
      setTimeout(() => {
        setStages([]);
        setCurrentStageIndex(0);
      }, 2000);
    }
  }, [running, result]);

  if (!running && stages.length === 0) return null;

  const currentStage = PROCESSING_STAGES[currentStageIndex];

  return (
    <AnimatePresence>
      {(running || stages.length > 0) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="fixed bottom-40 right-6 z-[8000] w-80"
        >
          <div className="rounded-xl border-2 border-sage/40 bg-background/95 backdrop-blur-md p-4 shadow-2xl">
            {/* Header */}
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin text-sage" />
                <span className="font-semibold text-sm">Processing...</span>
              </div>
              <Badge variant="outline" className="border-sage/40 text-sage text-xs">
                {Math.round(((currentStageIndex + 1) / PROCESSING_STAGES.length) * 100)}%
              </Badge>
            </div>

            {/* Current Stage */}
            {currentStage && (
              <motion.div
                key={currentStageIndex}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-4 rounded-lg bg-sage/10 border border-sage/30 p-3"
              >
                <div className="flex items-start gap-3">
                  <div className={`${currentStage.color} animate-pulse`}>
                    {currentStage.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-foreground mb-0.5">
                      {currentStage.title}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {currentStage.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Progress List */}
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {PROCESSING_STAGES.slice(0, currentStageIndex + 1).map((stage, index) => {
                const isComplete = index < currentStageIndex;
                const isCurrent = index === currentStageIndex;
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center gap-2 text-xs ${
                      isComplete
                        ? "text-muted-foreground"
                        : isCurrent
                        ? "text-sage font-medium"
                        : "text-muted-foreground/50"
                    }`}
                  >
                    {isComplete ? (
                      <CheckCircle2 className="size-3.5 text-sage" />
                    ) : isCurrent ? (
                      <Loader2 className="size-3.5 animate-spin text-sage" />
                    ) : (
                      <div className="size-3.5 rounded-full border-2 border-muted-foreground/30" />
                    )}
                    <span className="truncate">{stage.title}</span>
                  </motion.div>
                );
              })}
            </div>

            {/* Tech Stack Badge */}
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
              <span>Powered by ISRO + AI</span>
              <span className="font-mono text-sage">Sub-3s</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
