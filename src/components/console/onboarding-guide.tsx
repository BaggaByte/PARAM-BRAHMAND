import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, Sparkles, Map, LineChart, Shield, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useConsole } from "@/lib/store";

interface Step {
  title: string;
  description: string;
  icon: React.ReactNode;
  target?: string;
}

const ONBOARDING_STEPS: Step[] = [
  {
    title: "Welcome to PARAM-BRAHMAND! 🇮🇳",
    description: "An AI-powered satellite imagery analysis system for ISRO. Let's take a quick tour to help you get started.",
    icon: <Sparkles className="size-6 text-sage" />,
  },
  {
    title: "Select a Mission",
    description: "Click on any colored pin on the map or choose from the mission cards at the bottom to analyze real disasters and events across India.",
    icon: <Map className="size-6 text-sage" />,
    target: "map",
  },
  {
    title: "Ask Questions",
    description: "Type your question in natural language at the bottom (e.g., 'How severe is the flooding?') and press Enter. The AI will analyze satellite images and respond.",
    icon: <Sparkles className="size-6 text-sage" />,
    target: "query",
  },
  {
    title: "View Results",
    description: "Results appear on the right panel with easy-to-read reports. Click the tabs to see different types of analysis.",
    icon: <LineChart className="size-6 text-sage" />,
    target: "report",
  },
  {
    title: "Explore Agents & Layers",
    description: "On the left, see which AI specialist analyzed your query and what data layers were used. Click to learn more about each one.",
    icon: <Layers className="size-6 text-sage" />,
    target: "left-rail",
  },
  {
    title: "Trust the Physics",
    description: "All results are verified by physics laws to ensure 0% hallucination. Look for the green 'Firewall: PASSED' badge.",
    icon: <Shield className="size-6 text-sage" />,
    target: "firewall",
  },
];

export function OnboardingGuide() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Check if user has seen onboarding before
    const hasSeenOnboarding = localStorage.getItem("pb.onboarding_completed");
    if (!hasSeenOnboarding) {
      // Show onboarding after a short delay
      setTimeout(() => setIsOpen(true), 1000);
    }
  }, []);

  const handleComplete = () => {
    localStorage.setItem("pb.onboarding_completed", "true");
    setIsOpen(false);
    setCurrentStep(0);
  };

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const step = ONBOARDING_STEPS[currentStep];
  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm"
            onClick={handleSkip}
          />

          {/* Guide Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 z-[9999] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-sage/40 bg-background p-6 shadow-2xl"
          >
            {/* Close Button */}
            <button
              onClick={handleSkip}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close guide"
            >
              <X className="size-5" />
            </button>

            {/* Progress Bar */}
            <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <motion.div
                className="h-full bg-sage"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Step Counter */}
            <div className="mb-4 flex items-center justify-between">
              <span className="font-mono text-xs text-muted-foreground">
                Step {currentStep + 1} of {ONBOARDING_STEPS.length}
              </span>
              <button
                onClick={handleSkip}
                className="text-xs text-muted-foreground hover:text-foreground underline"
              >
                Skip tour
              </button>
            </div>

            {/* Icon */}
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-sage/10 p-4">
                {step.icon}
              </div>
            </div>

            {/* Content */}
            <div className="mb-6 text-center">
              <h2 className="mb-2 text-xl font-bold text-foreground">
                {step.title}
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between gap-3">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="gap-2"
              >
                <ChevronLeft className="size-4" />
                Back
              </Button>

              <div className="flex gap-1">
                {ONBOARDING_STEPS.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    className={`h-2 w-2 rounded-full transition-all ${
                      index === currentStep
                        ? "bg-sage w-6"
                        : index < currentStep
                        ? "bg-sage/50"
                        : "bg-secondary"
                    }`}
                    aria-label={`Go to step ${index + 1}`}
                  />
                ))}
              </div>

              <Button
                onClick={handleNext}
                className="gap-2 bg-sage text-background hover:bg-sage/90"
              >
                {currentStep === ONBOARDING_STEPS.length - 1 ? "Get Started" : "Next"}
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Quick help button that can reopen the guide
export function HelpButton() {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenGuide = () => {
    localStorage.removeItem("pb.onboarding_completed");
    window.location.reload();
  };

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={handleOpenGuide}
      title="Show guided tour"
      className="text-muted-foreground hover:text-sage"
    >
      <Sparkles className="size-4" />
    </Button>
  );
}
