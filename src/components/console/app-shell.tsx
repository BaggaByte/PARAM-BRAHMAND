import { Layers, ScrollText } from "lucide-react";
import { Group, Panel, Separator as ResizeHandle } from "react-resizable-panels";
import { Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useConsole } from "@/lib/store";
import { AboutDialog } from "./about-dialog";
import { AgentModal } from "./agent-modal";
import { AgentRail } from "./agent-rail";
import { BootScreen } from "./boot-screen";
import { LayerModal } from "./layer-modal";
import { LayerStack } from "./layer-stack";
import { MapViewport } from "./map-viewport";
import { MissionDock } from "./mission-dock";
import { QueryBar } from "./query-bar";
import { ReportPanel } from "./report-panel";
import { TopBar } from "./top-bar";
import { LeftRail } from "./left-rail";

export function AppShell() {
  const booted = useConsole((s) => s.booted);
  const mobileSheet = useConsole((s) => s.mobileSheet);
  const setMobileSheet = useConsole((s) => s.setMobileSheet);

  return (
    <TooltipProvider delayDuration={250}>
      <div className="flex h-dvh flex-col bg-background text-foreground">
        {!booted && <BootScreen />}
        <TopBar />

        <div className="flex min-h-0 flex-1">
          {/* Desktop instrument layout */}
          <div className="hidden min-h-0 min-w-0 flex-1 md:flex">
            <Group
              id="console-group"
              orientation="horizontal"
              className="h-full w-full"
              defaultLayout={{ rail: 24, map: 46, report: 30 }}
            >
              <Panel id="rail" defaultSize="24%" minSize="18%" maxSize="32%" className="min-h-0">
                <div className="flex h-full min-h-0 flex-col border-r border-border">
                  <LeftRail />
                </div>
              </Panel>
              <ResizeHandle className="w-px bg-border hover:bg-sage" />
              <Panel id="map" defaultSize="46%" minSize="35%" className="min-h-0">
                <MapViewport />
              </Panel>
              <ResizeHandle className="w-px bg-border hover:bg-sage" />
              <Panel id="report" defaultSize="30%" minSize="24%" maxSize="40%" className="min-h-0">
                <div className="h-full min-h-0 overflow-hidden border-l border-border">
                  <ReportPanel />
                </div>
              </Panel>
            </Group>
          </div>

          {/* Mobile: map first */}
          <div className="flex min-h-0 min-w-0 flex-1 flex-col md:hidden">
            <div className="min-h-0 flex-1">
              <MapViewport />
            </div>
          </div>
        </div>

        <footer className="shrink-0 border-t border-border bg-background px-3 py-2.5 md:px-4">
          <div className="mb-2 flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <MissionDock />
            </div>
            <div className="flex shrink-0 gap-1 md:hidden">
              <Button
                variant="outline"
                size="icon-sm"
                aria-label="Agents"
                onClick={() => setMobileSheet("agents")}
              >
                <Layers className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                aria-label="Brief"
                onClick={() => setMobileSheet("report")}
              >
                <ScrollText className="size-4" />
              </Button>
            </div>
          </div>
          <QueryBar />
        </footer>

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
          position="bottom-right"
          toastOptions={{
            classNames: {
              toast: "bg-card text-foreground border-border font-sans",
            },
          }}
        />
      </div>
    </TooltipProvider>
  );
}
