import { Component, useEffect, useState, type ComponentType, type ReactNode } from "react";
import { SlidersHorizontal } from "lucide-react";
import { useConsole } from "@/lib/store";
import { cn } from "@/lib/utils";

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

  useEffect(() => {
    void import("./map-inner").then((m) => setInner(() => m.MapInner));
  }, []);

  return (
    <div className="relative h-full min-h-64 w-full overflow-hidden bg-ink">
      <MapBoundary>
        {Inner ? (
          <Inner />
        ) : (
          <div className="flex h-full items-center justify-center font-mono text-xs text-muted-foreground">
            Loading terrain engine...
          </div>
        )}
      </MapBoundary>

      {/* Top Left Coordinate & Sensor Telemetry */}
      <div className="pointer-events-none absolute left-3 top-3 z-[400] rounded-md border border-border bg-background/90 px-3 py-1.5 font-mono text-xs text-muted-foreground shadow-xs backdrop-blur-xs">
        {result ? (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">
              {result.center[0].toFixed(3)}°N, {result.center[1].toFixed(3)}°E
            </span>
            <span>·</span>
            <span>GSD: {result.physics.gsdM.toFixed(1)}m</span>
            <span>·</span>
            <span className="text-sage font-medium">{result.mapMode.toUpperCase()}</span>
          </div>
        ) : (
          <span>India Sensor Coverage · Standby</span>
        )}
      </div>

      {/* Top Right Sensor Mode Switcher */}
      <div className="absolute right-3 top-3 z-[400] flex flex-col items-end gap-1.5">
        <div className="flex rounded-md border border-border bg-background/90 p-0.5 shadow-xs backdrop-blur-xs">
          {(["optical", "sar", "dem"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMapMode(m)}
              className={cn(
                "rounded-xs px-2.5 py-1 font-mono text-xs uppercase font-medium transition-colors",
                mapMode === m
                  ? "bg-sage text-background shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {m}
            </button>
          ))}
        </div>

        {/* SAR Sub-mode Toggle (Polarimetric Pauli RGB vs Grayscale Intensity) */}
        {mapMode === "sar" && (
          <div className="flex rounded-md border border-border bg-background/90 p-0.5 shadow-xs backdrop-blur-xs font-mono text-[11px]">
            <button
              type="button"
              onClick={() => setSarDisplayMode("intensity")}
              className={cn(
                "rounded-xs px-2 py-0.5 transition-colors",
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
                "rounded-xs px-2 py-0.5 transition-colors",
                sarDisplayMode === "pauli_rgb"
                  ? "bg-sage text-background font-semibold"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Pauli RGB (Pd/Pv/Ps)
            </button>
          </div>
        )}
      </div>

      {/* SAR Pauli Legend when in Pauli RGB mode */}
      {mapMode === "sar" && sarDisplayMode === "pauli_rgb" && (
        <div className="pointer-events-none absolute left-3 bottom-14 z-[400] rounded-md border border-border bg-background/90 px-3 py-1.5 font-mono text-[11px] shadow-xs backdrop-blur-xs">
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

      {/* Bi-temporal Comparison Swipe Widget */}
      {result?.swipeEnabled && (
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
      )}
    </div>
  );
}
