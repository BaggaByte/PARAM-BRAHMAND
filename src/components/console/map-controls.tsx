import { motion } from "framer-motion";
import {
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  MapPin,
  Info,
  Compass,
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
      {/* Top-Right Controls */}
      <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2">
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
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomIn}
              disabled={zoom >= 17}
              className="rounded-none border-b border-border h-10 w-10"
              title="Zoom In"
            >
              <ZoomIn className="size-4" />
            </Button>
            <div className="px-2 py-1 text-center border-b border-border">
              <span className="text-xs font-mono text-sage">{zoom}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomOut}
              disabled={zoom <= 4}
              className="rounded-none h-10 w-10"
              title="Zoom Out"
            >
              <ZoomOut className="size-4" />
            </Button>
          </div>
        </motion.div>

        {/* Reset View Button */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            variant="outline"
            size="icon"
            onClick={handleResetView}
            className="bg-background/95 backdrop-blur-sm shadow-lg h-10 w-10"
            title="Reset to mission location"
          >
            <Target className="size-4" />
          </Button>
        </motion.div>
      </div>

      {/* Bottom-Left Info Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-4 left-4 z-[400] rounded-lg border-2 border-border bg-background/95 backdrop-blur-sm shadow-lg p-3 max-w-xs"
      >
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-sage/10">
            <MapPin className="size-4 text-sage" />
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            {/* Map Instructions */}
            {!result && (
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-foreground">How to Use Map:</h4>
                <ul className="text-xs text-muted-foreground space-y-0.5">
                  <li>• Click any pulsing pin to load mission</li>
                  <li>• Drag to pan, scroll to zoom</li>
                  <li>• Switch views using mode selector</li>
                </ul>
              </div>
            )}

            {/* Cursor Coordinates */}
            {cursorCoords && (
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-foreground">Current Position:</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Lat:</span>{" "}
                    <span className="font-mono text-sage">{cursorCoords.lat}°</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Lon:</span>{" "}
                    <span className="font-mono text-sage">{cursorCoords.lng}°</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Elevation:</span>{" "}
                    <span className="font-mono text-sage">{cursorCoords.elev}m</span>
                  </div>
                </div>
              </div>
            )}

            {/* Map Mode Badge */}
            <div className="flex items-center gap-2 pt-1">
              <Badge variant="outline" className="border-sage/40 text-sage text-xs">
                {currentMode?.label}
              </Badge>
              {mapMode === "sar" && (
                <span className="text-xs text-muted-foreground">All-weather radar</span>
              )}
              {mapMode === "thermal" && (
                <span className="text-xs text-muted-foreground">Heat/fire detection</span>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Map Legend (when results are shown) */}
      {result && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-4 left-4 z-[400] rounded-lg border-2 border-border bg-background/95 backdrop-blur-sm shadow-lg p-3 max-w-xs"
        >
          <div className="flex items-center gap-2 mb-2">
            <Info className="size-4 text-sage" />
            <h4 className="text-xs font-semibold">Map Legend</h4>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-[#5b9aa0]" />
              <span className="text-muted-foreground">Flood / Water body</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-[#7a9e8a]" />
              <span className="text-muted-foreground">Canopy flood (hidden)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-[#c45c4a]" />
              <span className="text-muted-foreground">Subsidence / Hazard</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-[#4a7c59]" />
              <span className="text-muted-foreground">Forest / Mangrove</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-[#f97316]" />
              <span className="text-muted-foreground">Fire / Thermal hotspot</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-[#eab308]" />
              <span className="text-muted-foreground">Mineral / Resource</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Compass (decorative) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="absolute bottom-4 right-4 z-[400] p-2 rounded-full bg-background/80 backdrop-blur-sm border border-border shadow-lg"
        title="North"
      >
        <Compass className="size-5 text-sage" />
      </motion.div>
    </>
  );
}
