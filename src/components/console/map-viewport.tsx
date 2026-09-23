import { Component, useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Navigation,
  Satellite,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useConsole } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SARDualComparisonViewer } from "./SARDualComparisonViewer";

type InnerProps = Record<string, never>;

class MapBoundary extends Component<{ children: ReactNode }, { error: string | null }> {
  state = { error: null as string | null };
  static getDerivedStateFromError(error: unknown) {
    return { error: error instanceof Error ? error.message : "Map failed" };
  }
  render() {
    if (this.state.error) {
      return (
        <div className="flex h-full items-center justify-center px-4 text-center text-sm text-muted-foreground">
          Terrain view unavailable. Reset the console to reload.
        </div>
      );
    }
    return this.props.children;
  }
}

export function MapViewport() {
  const [Inner, setInner] = useState<ComponentType<InnerProps> | null>(null);
  const result = useConsole((s) => s.result);
  const mapMode = useConsole((s) => s.mapMode);
  const setMapMode = useConsole((s) => s.setMapMode);
  const sarDisplayMode = useConsole((s) => s.sarDisplayMode);
  const setSarDisplayMode = useConsole((s) => s.setSarDisplayMode);
  const swipe = useConsole((s) => s.swipe);
  const setSwipe = useConsole((s) => s.setSwipe);
  const cursorCoords = useConsole((s) => s.cursorCoords);
  const dualSarDemoOpen = useConsole((s) => s.dualSarDemoOpen);
  const setDualSarDemoOpen = useConsole((s) => s.setDualSarDemoOpen);

  // Satellite orbit telemetry state (NISAR vs EOS-04)
  const [satIndex, setSatIndex] = useState(0);
  const [orbitCountdown, setOrbitCountdown] = useState(842); // seconds until next Indian swath acquisition
  const isDraggingSwipe = useRef(false);
  const viewportRef = useRef<HTMLDivElement>(null);

  const SATELLITES = [
    {
      name: "NISAR (NASA-ISRO SAR)",
      sensor: "Dual-Pol L+S Band",
      alt: "747 km",
      swath: "242 km",
      res: "3-10m",
      orbit: "Sun-Sync 98.4°",
      status: "ACTIVE RADAR ACQUISITION",
    },
    {
      name: "ISRO EOS-04 (RISAT-1A)",
      sensor: "C-Band Quad-Pol SAR",
      alt: "529 km",
      swath: "10-225 km",
      res: "1-50m",
      orbit: "Sun-Sync 97.5°",
      status: "INTERFEROMETRIC PASS",
    },
    {
      name: "Cartosat-3",
      sensor: "PAN + 4-Band Multispectral",
      alt: "505 km",
      swath: "17.4 km",
      res: "0.28m VNIR",
      orbit: "Sun-Sync 97.5°",
      status: "STEREO RECONNAISSANCE",
    },
  ];

  useEffect(() => {
    void import("./map-inner").then((m) => setInner(() => m.MapInner));
  }, []);

  // Orbit countdown & satellite cycling ticker
  useEffect(() => {
    const timer = window.setInterval(() => {
      setOrbitCountdown((prev) => (prev > 1 ? prev - 1 : 1200));
    }, 1000);
    const cycleTimer = window.setInterval(() => {
      setSatIndex((prev) => (prev + 1) % SATELLITES.length);
    }, 12000);
    return () => {
      window.clearInterval(timer);
      window.clearInterval(cycleTimer);
    };
  }, [SATELLITES.length]);

  const activeSat = SATELLITES[satIndex];
  const minutes = Math.floor(orbitCountdown / 60);
  const seconds = orbitCountdown % 60;

  // On-map drag handler for bi-temporal split line
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!result?.swipeEnabled) return;
    isDraggingSwipe.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingSwipe.current || !viewportRef.current) return;
    const rect = viewportRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(5, Math.min(95, Math.round((x / rect.width) * 100)));
    setSwipe(pct);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDraggingSwipe.current) {
      isDraggingSwipe.current = false;
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  /* ── Dual SAR jury demo overrides the map viewport ── */
  if (dualSarDemoOpen) {
    return (
      <div className="relative h-full min-h-64 w-full overflow-hidden bg-ink">
        <div className="absolute right-3 top-3 z-40">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 bg-background/90 backdrop-blur-sm"
            onClick={() => setDualSarDemoOpen(false)}
            title="Return to map"
          >
            <X className="size-3.5" />
            Close Dual Demo
          </Button>
        </div>
        <SARDualComparisonViewer className="h-full rounded-none border-0" />
      </div>
    );
  }

  return (
    <div
      ref={viewportRef}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className="relative h-full min-h-64 w-full overflow-hidden bg-ink select-none"
    >
      <MapBoundary>
        {Inner ? (
          <Inner />
        ) : (
          <div className="flex h-full items-center justify-center font-mono text-xs text-muted-foreground">
            Loading terrain engine...
          </div>
        )}
      </MapBoundary>

      {/* Satellite HUD + Coordinate bar — single row below top bar */}
      <div className="pointer-events-none absolute left-3 top-[68px] z-[400] flex items-center gap-2 rounded-md border border-border/90 bg-background/90 px-2.5 py-1 font-mono text-[10.5px] shadow-xs backdrop-blur-md">
        <Satellite className="size-3 text-sage shrink-0" />
        <span className="text-sage font-semibold">{activeSat.name}</span>
        <span className="text-muted-foreground/50">·</span>
        <span className="text-muted-foreground hidden md:inline">{activeSat.sensor}</span>
        <span className="text-muted-foreground/50 hidden md:inline">·</span>
        <span className="size-1.5 rounded-full bg-emerald-400 animate-ping" />
        <span className="text-emerald-400 font-medium">T-{minutes}m {seconds < 10 ? `0${seconds}` : seconds}s</span>
        {result && (
          <>
            <span className="text-muted-foreground/50">·</span>
            <span className="text-foreground font-semibold">{result.center[0].toFixed(3)}°N, {result.center[1].toFixed(3)}°E</span>
            <span className="text-muted-foreground/50">·</span>
            <span>GSD: {result.physics.gsdM.toFixed(1)}m</span>
            <span className="text-muted-foreground/50">·</span>
            <span className="text-sage font-medium">{result.mapMode.toUpperCase()}</span>
          </>
        )}
        {!result && <><span className="text-muted-foreground/50">·</span><span>India Sensor Coverage · Standby</span></>}
      </div>

      {/* SAR Sub-mode Toggle — shown below satellite HUD on left side */}
      {mapMode === "sar" && (
        <div className="absolute left-3 top-[96px] z-[400] flex rounded-md border border-border bg-background/90 p-0.5 shadow-xs backdrop-blur-xs font-mono text-[11px]">
          <button
            type="button"
            onClick={() => setSarDisplayMode("intensity")}
            className={cn(
              "rounded-xs px-2 py-0.5 transition-colors cursor-pointer",
              sarDisplayMode === "intensity"
                ? "bg-secondary text-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            σ⁰ Intensity
          </button>
          <button
            type="button"
            onClick={() => setSarDisplayMode("pauli_rgb")}
            className={cn(
              "rounded-xs px-2 py-0.5 transition-colors cursor-pointer",
              sarDisplayMode === "pauli_rgb"
                ? "bg-sage text-background font-semibold"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Pauli RGB
          </button>
        </div>
      )}

      {/* SAR Pauli Legend when in Pauli RGB mode */}
      {mapMode === "sar" && sarDisplayMode === "pauli_rgb" && (
        <div className="pointer-events-none absolute left-3 bottom-[220px] z-[400] rounded-md border border-border bg-background/90 px-3 py-1.5 font-mono text-[11px] shadow-xs backdrop-blur-xs">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
            Pauli Polarimetric Decomposition
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-red-400">
              <span className="size-2 rounded-full bg-red-500" />
              <span>Pd Double-Bounce</span>
            </span>
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="size-2 rounded-full bg-emerald-500" />
              <span>Pv Canopy Dipoles</span>
            </span>
            <span className="flex items-center gap-1 text-blue-400">
              <span className="size-2 rounded-full bg-blue-500" />
              <span>Ps Specular Water</span>
            </span>
          </div>
        </div>
      )}

      {/* Live Cursor Crosshairs & DEM Elevation HUD */}
      {cursorCoords && (
        <div className="pointer-events-none absolute left-3 bottom-[220px] z-[400] flex items-center gap-2.5 rounded-md border border-border/80 bg-background/90 px-2.5 py-1 font-mono text-[11px] text-muted-foreground shadow-xs backdrop-blur-xs">
          <Navigation className="size-3 text-sage shrink-0" />
          <span className="text-foreground font-medium">
            {cursorCoords.lat >= 0
              ? `${cursorCoords.lat.toFixed(4)}°N`
              : `${Math.abs(cursorCoords.lat).toFixed(4)}°S`}
            ,{" "}
            {cursorCoords.lng >= 0
              ? `${cursorCoords.lng.toFixed(4)}°E`
              : `${Math.abs(cursorCoords.lng).toFixed(4)}°W`}
          </span>
          <span className="text-muted-foreground/50">·</span>
          <span>
            ELEV: <strong className="text-sage">{cursorCoords.elev}m</strong> ASL
          </span>
          <span className="text-muted-foreground/50">·</span>
          <span>SRTM-30</span>
        </div>
      )}

      {/* Interactive Bi-Temporal Divider Line directly on the Map */}
      {result?.swipeEnabled && (
        <>
          <div
            style={{ left: `${swipe}%` }}
            onPointerDown={handlePointerDown}
            className="absolute top-0 bottom-0 w-0.5 -ml-px bg-sage/70 z-[390] cursor-ew-resize"
          >
            {/* Gradient vignettes flanking the divider for soft fade */}
            <div
              className="swipe-vignette-left pointer-events-none"
              style={{ right: "100%", left: "auto" }}
            />
            <div
              className="swipe-vignette-right pointer-events-none"
              style={{ left: "100%" }}
            />

            {/* Center Handle Knob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-9 rounded-full border-2 border-sage bg-background/95 shadow-lg shadow-sage/20 flex items-center justify-center text-sage cursor-ew-resize hover:scale-110 hover:shadow-sage/40 transition-all duration-150">
              <div className="flex items-center -space-x-1">
                <ChevronLeft className="size-3" />
                <ChevronRight className="size-3" />
              </div>
            </div>

            {/* Left/Right Floating Badges on Split Line */}
            <div className="pointer-events-none absolute top-14 -left-32 w-28 text-right">
              <span className="rounded-xs border border-border bg-background/85 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground shadow-xs">
                ◀ {result.beforeLabel ?? "T0 Baseline"}
              </span>
            </div>
            <div className="pointer-events-none absolute top-14 left-4 w-28 text-left">
              <span className="rounded-xs border border-sage/60 bg-sage/20 px-1.5 py-0.5 font-mono text-[10px] text-sage font-medium shadow-xs">
                {result.afterLabel ?? "T1 Pass"} ▶
              </span>
            </div>
          </div>

          {/* Bottom Bi-temporal Slider Controls */}
          <div className="absolute inset-x-8 bottom-6 z-[400] rounded-lg border border-border/80 bg-background/90 p-3 shadow-lg backdrop-blur-xs max-w-xl mx-auto">
            <div className="mb-1.5 flex items-center justify-between font-mono text-xs">
              <span className="font-semibold text-foreground">
                ◀ {result.beforeLabel ?? "Pre-Event Baseline (T0)"}
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <SlidersHorizontal className="size-3 text-sage" />
                <span>Bi-Temporal Split: {swipe}%</span>
              </span>
              <span className="font-semibold text-sage">
                {result.afterLabel ?? "Post-Event Pass (T1)"} ▶
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={swipe}
              onChange={(e) => setSwipe(Number(e.target.value))}
              className="w-full accent-sage h-1.5 rounded-lg cursor-ew-resize"
              aria-label="Bi-temporal satellite image comparison swipe"
            />
          </div>
        </>
      )}
    </div>
  );
}
