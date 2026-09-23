import { useState } from "react";
import { Layers, ScrollText } from "lucide-react";
import { Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useConsole } from "@/lib/store";
import { AboutDialog } from "./about-dialog";
import { AgentModal } from "./agent-modal";
import { BootScreen } from "./boot-screen";
import { LayerModal } from "./layer-modal";
import { MapViewport } from "./map-viewport";
import { MissionDock } from "./mission-dock";
import { QueryBar } from "./query-bar";
import { ReportPanel } from "./report-panel";
import { TopBar } from "./top-bar";
import { LeftRail } from "./left-rail";
import { SoundManager } from "./sound-manager";
import { OnboardingGuide } from "./onboarding-guide";
import { WelcomeScreen } from "./welcome-screen";
import { DemoMode } from "./demo-mode";
import { LiveProcessingViz } from "./live-processing-viz";
import { JuryHelperMenu } from "./jury-helper-menu";

export function AppShell() {
  const booted = useConsole((s) => s.booted);
  const mobileSheet = useConsole((s) => s.mobileSheet);
  const setMobileSheet = useConsole((s) => s.setMobileSheet);
  const result = useConsole((s) => s.result);
  const running = useConsole((s) => s.running);
  const [showWelcome, setShowWelcome] = useState(() => {
    if (typeof window !== "undefined") {
      return !localStorage.getItem("pb.onboarding_completed");
    }
    return false;
  });

  const handleGetStarted = () => {
    setShowWelcome(false);
  };

  if (showWelcome) {
    return (
      <TooltipProvider delayDuration={250}>
        <div className="flex h-dvh flex-col bg-background text-foreground">
          <TopBar />
          <WelcomeScreen onGetStarted={handleGetStarted} />
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider delayDuration={250}>
      <div className="relative flex h-dvh w-screen flex-col overflow-hidden bg-background text-foreground">
        {!booted && <BootScreen />}
        <SoundManager />
        <OnboardingGuide />
        <DemoMode />
        <JuryHelperMenu />

        {/* Floating Top Bar */}
        <div className="absolute left-0 top-0 z-40 w-full pointer-events-none">
          <div className="pointer-events-auto">
            <TopBar />
          </div>
        </div>

        {/* Fullscreen Interactive Map Layer */}
        <div className="absolute inset-0 z-0">
          <MapViewport />
        </div>

        {/* Live processing overlay */}
        <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center">
          <LiveProcessingViz />
        </div>

        {/* Results Slide-over Panel */}
        <div
          className={`absolute right-4 top-20 z-20 w-[min(420px,calc(100vw-2rem))] bottom-44 max-h-full transition-transform duration-500 ease-out ${
            result && !running ? "translate-x-0 opacity-100 pointer-events-auto" : "translate-x-full opacity-0 pointer-events-none"
          }`}
        >
          <div className="h-full rounded-2xl border border-border/50 bg-background/80 backdrop-blur-xl shadow-2xl overflow-hidden glass-morphism">
            <ReportPanel />
          </div>
        </div>

        {/* Floating Query Command Center at Bottom */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-3xl px-4 pointer-events-none">
          <div className="pointer-events-auto rounded-3xl border border-white/10 bg-background/70 p-3 backdrop-blur-2xl shadow-2xl">
            <div className="mb-2">
              <MissionDock />
            </div>
            <QueryBar />
          </div>
        </div>

        {/* Mobile controls */}
        <div className="absolute bottom-44 right-4 z-40 flex flex-col gap-2 md:hidden pointer-events-none">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full bg-background/80 backdrop-blur pointer-events-auto shadow-lg"
            onClick={() => setMobileSheet("agents")}
          >
            <Layers className="size-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full bg-background/80 backdrop-blur pointer-events-auto shadow-lg"
            onClick={() => setMobileSheet("report")}
          >
            <ScrollText className="size-5" />
          </Button>
        </div>

        {/* Mobile Sheets */}
        <Sheet
          open={mobileSheet === "agents"}
          onOpenChange={(o) => setMobileSheet(o ? "agents" : null)}
        >
          <SheetContent side="left" className="p-0 flex flex-col">
            <SheetHeader className="px-3 pt-4 pb-3 border-b border-border">
              <SheetTitle>Navigation</SheetTitle>
            </SheetHeader>
            <div className="min-h-0 flex-1">
              <LeftRail />
            </div>
          </SheetContent>
        </Sheet>

        <Sheet
          open={mobileSheet === "report"}
          onOpenChange={(o) => setMobileSheet(o ? "report" : null)}
        >
          <SheetContent side="bottom" className="p-0 flex flex-col max-h-[85vh]">
            <SheetHeader className="px-3 pt-4 pb-3 border-b border-border">
              <SheetTitle>Analysis Report</SheetTitle>
            </SheetHeader>
            <div className="min-h-0 flex-1 overflow-auto">
              <ReportPanel />
            </div>
          </SheetContent>
        </Sheet>

        <AboutDialog />
        <AgentModal />
        <LayerModal />
        
        <Toaster
          theme="dark"
          position="top-center"
          toastOptions={{
            classNames: {
              toast: "bg-card text-foreground border-border font-sans rounded-xl shadow-xl",
            },
          }}
        />
      </div>
    </TooltipProvider>
  );
}
