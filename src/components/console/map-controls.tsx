import { motion } from "framer-motion";
import {
  ZoomIn,
  ZoomOut,
  MapPin,
  Grid3x3,
  Eye,
  Target,
  Flame
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useConsole } from "@/lib/store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function MapControls() {
  const cursorCoords = useConsole((s) => s.cursorCoords);
  const mapMode = useConsole((s) => s.mapMode);
  const setMapMode = useConsole((s) => s.setMapMode);
  const center = useConsole((s) => s.center);
  const zoom = useConsole((s) => s.zoom);
  const result = useConsole((s) => s.result);
  const flyToPosition = useConsole((s) => s.flyToPosition);

  const handleZoomIn = () => {
    flyToPosition(center, Math.min(zoom + 1, 17));
  };

  const handleZoomOut = () => {
    flyToPosition(center, Math.max(zoom - 1, 4));
  };

  const handleResetView = () => {
    if (result) {
      const mission = result.missionId;
      if (mission) {
        const { MISSIONS } = require("@/lib/engine/missions");
        const m = MISSIONS.find((ms: any) => ms.id === mission);
        if (m) {
          flyToPosition(m.center, m.zoom);
          return;
        }
      }
    }
    flyToPosition([22.97, 78.66], 5); // India center
  };

  const mapModes = [
    { value: "optical" as const, label: "Satellite View", icon: <Eye className="size-4" /> },
    { value: "sar" as const, label: "Radar (SAR)", icon: <Grid3x3 className="size-4" /> },
    { value: "dem" as const, label: "Terrain (DEM)", icon: <Layers className="size-4" /> },
    { value: "thermal" as const, label: "Thermal (IR)", icon: <Flame className="size-4" /> },
  ];

  const currentMode = mapModes.find((m) => m.value === mapMode);

  return (
    <>
      {/* Top-Right Controls — only when idle (no result) */}
      {!result && (
        <div className="absolute top-[68px] right-4 z-[400] flex flex-col gap-2">
          {/* Map Mode Selector */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-lg border-2 border-border bg-background/95 backdrop-blur-sm shadow-lg"
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 h-10 px-3">
                  {currentMode?.icon}
                  <span className="hidden sm:inline text-sm font-medium">
                    {currentMode?.label}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Map Display Mode
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {mapModes.map((mode) => (
                  <DropdownMenuItem
                    key={mode.value}
                    onClick={() => setMapMode(mode.value)}
                    className="gap-2"
                  >
                    {mode.icon}
                    <span>{mode.label}</span>
                    {mapMode === mode.value && (
                      <span className="ml-auto text-xs text-sage">✓</span>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>

          {/* Zoom Controls */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-lg border-2 border-border bg-background/95 backdrop-blur-sm shadow-lg overflow-hidden"
          >
            <div className="flex flex-col">
              <Button variant="ghost" size="icon" onClick={handleZoomIn} disabled={zoom >= 17} className="rounded-none border-b border-border h-10 w-10" title="Zoom In"><ZoomIn className="size-4" /></Button>
              <div className="px-2 py-1 text-center border-b border-border"><span className="text-xs font-mono text-sage">{zoom}</span></div>
              <Button variant="ghost" size="icon" onClick={handleZoomOut} disabled={zoom <= 4} className="rounded-none h-10 w-10" title="Zoom Out"><ZoomOut className="size-4" /></Button>
            </div>
          </motion.div>

          {/* Reset View Button */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <Button variant="outline" size="icon" onClick={handleResetView} className="bg-background/95 backdrop-blur-sm shadow-lg h-10 w-10" title="Reset to mission location">
              <Target className="size-4" />
            </Button>
          </motion.div>
        </div>
      )}

      {/* When result shown: only a minimal zoom bar on right */}
      {result && (
        <div className="absolute top-[68px] right-4 z-[400] flex flex-col gap-1 rounded-lg border border-border/60 bg-background/80 backdrop-blur-sm shadow-md overflow-hidden">
          <Button variant="ghost" size="icon" onClick={handleZoomIn} disabled={zoom >= 17} className="rounded-none h-8 w-8" title="Zoom In"><ZoomIn className="size-3.5" /></Button>
          <div className="px-1 py-0.5 text-center border-y border-border/40"><span className="text-[10px] font-mono text-sage">{zoom}</span></div>
          <Button variant="ghost" size="icon" onClick={handleZoomOut} disabled={zoom <= 4} className="rounded-none h-8 w-8" title="Zoom Out"><ZoomOut className="size-3.5" /></Button>
        </div>
      )}

      {/* Bottom-Left Status Pills — only when idle */}
      {!result && (
        <div className="absolute bottom-[210px] left-3 z-[400] flex flex-col gap-1.5">
          <div className="flex items-center gap-2 rounded-full border border-border/80 bg-background/90 backdrop-blur-sm px-3 py-1.5 text-xs text-muted-foreground shadow-sm">
            <MapPin className="size-3 text-sage shrink-0" />
            <span>Click a pin · drag to pan · scroll to zoom</span>
          </div>
          {cursorCoords && (
            <div className="flex items-center gap-2 rounded-full border border-border/80 bg-background/90 backdrop-blur-sm px-3 py-1.5 font-mono text-xs text-muted-foreground shadow-sm">
              <span className="text-sage font-semibold">{cursorCoords.lat}&deg; N</span>
              <span className="text-muted-foreground/40">,</span>
              <span className="text-sage font-semibold">{cursorCoords.lng}&deg; E</span>
              <span className="text-muted-foreground/40">·</span>
              <span>{cursorCoords.elev}m</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 rounded-full border border-border/80 bg-background/90 backdrop-blur-sm px-3 py-1 text-xs shadow-sm">
            <Badge variant="outline" className="border-sage/40 text-sage text-[10px] py-0 px-1.5">{currentMode?.label}</Badge>
            {mapMode === "sar" && <span className="text-muted-foreground">All-weather radar</span>}
            {mapMode === "thermal" && <span className="text-muted-foreground">Heat detection</span>}
            {mapMode === "dem" && <span className="text-muted-foreground">Terrain elevation</span>}
            {mapMode === "optical" && <span className="text-muted-foreground">True color</span>}
          </div>
        </div>
      )}

      {/* Map Legend — removed (clutters when result shown) */}
    </>
  );
}
