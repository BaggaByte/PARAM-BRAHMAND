import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipForward, X, Volume2, VolumeX, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useConsole } from "@/lib/store";
import { MISSIONS } from "@/lib/engine/missions";

interface DemoStep {
  title: string;
  description: string;
  narration: string;
  action?: () => void;
  duration?: number;
}

export function DemoMode() {
  const [isDemoActive, setIsDemoActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [narrationEnabled, setNarrationEnabled] = useState(true);
  const demoModeOpen = useConsole((s) => s.demoModeOpen);
  const setDemoModeOpen = useConsole((s) => s.setDemoModeOpen);
  const loadMission = useConsole((s) => s.loadMission);
  const submit = useConsole((s) => s.submit);
  const setQuery = useConsole((s) => s.setQuery);
  const result = useConsole((s) => s.result);
  const running = useConsole((s) => s.running);

  useEffect(() => {
    if (demoModeOpen && !isDemoActive) {
      setIsDemoActive(true);
      setCurrentStep(0);
      setIsPaused(false);
    }
  }, [demoModeOpen, isDemoActive]);

  const DEMO_STEPS: DemoStep[] = [
    {
      title: "Welcome to Live Demo",
      description: "Watch as we analyze real satellite imagery of disasters across India",
      narration: "Welcome! Let me show you how we use space technology to help disaster management.",
      duration: 3000,
    },
    {
      title: "Step 1: Select Disaster Location",
      description: "We have 8 real case studies from floods to forest fires",
      narration: "First, we select a location. Let's analyze the Kaziranga flood in Assam.",
      action: () => loadMission("kaziranga"),
      duration: 4000,
    },
    {
      title: "Step 2: Ask in Simple Language",
      description: "Type questions in plain English or 8 Indian languages",
      narration: "Now we ask a simple question: Is there flooding under the forest canopy?",
      action: () => {
        setQuery("Is there flooding under the forest canopy in Kaziranga?");
      },
      duration: 4000,
    },
    {
      title: "Step 3: AI Analysis Begins",
      description: "9 specialist AIs analyze different aspects of the satellite image",
      narration: "Our AI specialists now analyze the satellite data using radar and optical sensors.",
      action: () => {
        const query = "Is there flooding under the forest canopy in Kaziranga?";
        submit(query);
      },
      duration: 5000,
    },
    {
      title: "Step 4: Physics Verification",
      description: "Every result is checked against physics laws to prevent errors",
      narration: "Unlike other AIs, we verify results with physics laws - zero hallucination guaranteed!",
      duration: 4000,
    },
    {
      title: "Step 5: Results Ready",
      description: "Get detailed reports in seconds with maps, charts, and action plans",
      narration: "Results are ready! We see flooding confirmed with exact measurements and emergency protocols.",
      duration: 4000,
    },
    {
      title: "Technology Showcase",
      description: "Built with cutting-edge space technology and AI",
      narration: "This uses ISRO satellites, advanced radar, and AI trained specifically for Indian disasters.",
      duration: 5000,
    },
  ];

  const currentDemoStep = DEMO_STEPS[currentStep];

  useEffect(() => {
    if (!isDemoActive || isPaused) return;

    const timer = setTimeout(() => {
      if (currentDemoStep.action) {
        currentDemoStep.action();
      }

      if (currentStep < DEMO_STEPS.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        // Demo complete
        setTimeout(() => setIsDemoActive(false), 2000);
      }
    }, currentDemoStep.duration || 3000);

    return () => clearTimeout(timer);
  }, [isDemoActive, currentStep, isPaused]);

  // Text-to-speech narration
  useEffect(() => {
    if (!isDemoActive || !narrationEnabled) return;

    if (typeof window !== "undefined" && window.speechSynthesis && currentDemoStep.narration) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentDemoStep.narration);
      utterance.lang = "en-IN";
      utterance.rate = 0.9;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.speechSynthesis.cancel();
      }
    };
  }, [isDemoActive, currentStep, narrationEnabled, currentDemoStep.narration]);

  const startDemo = () => {
    setIsDemoActive(true);
    setCurrentStep(0);
    setIsPaused(false);
  };

  const stopDemo = () => {
    setIsDemoActive(false);
    setCurrentStep(0);
    setIsPaused(false);
    setDemoModeOpen(false);
    if (typeof window !== "undefined") {
      window.speechSynthesis.cancel();
    }
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const skipStep = () => {
    if (currentStep < DEMO_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  return (
    <>
      {/* Demo Overlay */}
      <AnimatePresence>
        {isDemoActive && (
          <>
            {/* Narration Box */}
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-20 left-1/2 -translate-x-1/2 z-[9000] w-full max-w-2xl px-4"
            >
              <div className="rounded-xl border-2 border-sage bg-background/95 backdrop-blur-md p-6 shadow-2xl">
                {/* Progress Bar */}
                <div className="mb-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Step {currentStep + 1} of {DEMO_STEPS.length}</span>
                  <Badge variant="outline" className="border-sage text-sage">
                    LIVE DEMO
                  </Badge>
                </div>
                
                <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <motion.div
                    className="h-full bg-sage"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentStep + 1) / DEMO_STEPS.length) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-sage mb-1">
                        {currentDemoStep.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {currentDemoStep.description}
                      </p>
                    </div>
                    <button
                      onClick={stopDemo}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="size-5" />
                    </button>
                  </div>

                  {/* Narration Text */}
                  {narrationEnabled && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="rounded-lg bg-sage/10 border border-sage/30 p-3"
                    >
                      <div className="flex items-center gap-2 text-sage text-sm">
                        <Volume2 className="size-4 animate-pulse" />
                        <span className="italic">"{currentDemoStep.narration}"</span>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Controls */}
                <div className="mt-4 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={togglePause}
                      className="gap-2"
                    >
                      {isPaused ? (
                        <>
                          <Play className="size-4" />
                          Resume
                        </>
                      ) : (
                        <>
                          <Pause className="size-4" />
                          Pause
                        </>
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={skipStep}
                      disabled={currentStep === DEMO_STEPS.length - 1}
                      className="gap-2"
                    >
                      <SkipForward className="size-4" />
                      Skip
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setNarrationEnabled(!narrationEnabled)}
                    className="gap-2"
                  >
                    {narrationEnabled ? (
                      <>
                        <Volume2 className="size-4" />
                        Voice On
                      </>
                    ) : (
                      <>
                        <VolumeX className="size-4" />
                        Voice Off
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Step Indicator Dots */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed top-[340px] left-1/2 -translate-x-1/2 z-[9000] flex gap-2"
            >
              {DEMO_STEPS.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentStep
                      ? "bg-sage w-8"
                      : index < currentStep
                      ? "bg-sage/50 w-2"
                      : "bg-secondary w-2"
                  }`}
                  aria-label={`Go to step ${index + 1}`}
                />
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
