/**
 * SARDualComparisonViewer — Live jury demo component for Optical vs Kaal-Radar SAR
 * PARAM-BRAHMAND · ISRO PS 26167
 *
 * Features:
 *  - Interactive split / draggable slider comparison
 *  - Cloud-cover simulation (0–100 %)
 *  - Yamaguchi AG4U scattering layer toggles (Ps / Pd / Pv)
 *  - Sub-canopy flood (RVoG) highlight mode
 *  - Live metrics HUD (latency · accuracy · VRAM)
 *  - Fully self-contained mock imagery — no backend required
 */

import { useCallback, useRef, useState } from "react";
import {
  Cloud,
  CloudOff,
  Layers,
  Radar,
  Eye,
  Waves,
  Activity,
  Cpu,
  Gauge,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/* ──────────────────────────── types ──────────────────────────── */

type ScatteringKey = "surface" | "doubleBounce" | "volume";

interface ScatteringState {
  surface: boolean; // Ps
  doubleBounce: boolean; // Pd
  volume: boolean; // Pv
}

/* ────────────────────────── mock visuals ─────────────────────── */

/** Optical side: soft terrain + progressive cloud veil */
function OpticalCanvas({
  cloudCover,
  className,
}: {
  cloudCover: number;
  className?: string;
}) {
  const opacity = Math.min(1, cloudCover / 100);
  return (
    <div className={cn("relative h-full w-full overflow-hidden", className)}>
      {/* Base optical terrain (Kaziranga-ish greens & river) */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 30% 70%, #2d5a3f 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 70% 40%, #3d6b4f 0%, transparent 50%),
            linear-gradient(160deg, #1a3a2a 0%, #2a4a35 40%, #1e3d28 100%)
          `,
        }}
      />
      {/* River suggestion */}
      <div
        className="absolute left-[15%] top-[55%] h-[18%] w-[70%] rounded-full opacity-40"
        style={{
          background: "linear-gradient(90deg, #1e4a5a, #2a6a7a, #1e4a5a)",
          filter: "blur(8px)",
        }}
      />
      {/* Cloud veil */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          opacity,
          background: `
            radial-gradient(ellipse 120% 80% at 20% 30%, rgba(220,230,240,0.85) 0%, transparent 50%),
            radial-gradient(ellipse 90% 70% at 75% 20%, rgba(200,215,230,0.9) 0%, transparent 45%),
            radial-gradient(ellipse 100% 60% at 50% 80%, rgba(210,220,235,0.75) 0%, transparent 55%),
            linear-gradient(180deg, rgba(180,195,215,0.6) 0%, rgba(160,180,200,0.4) 100%)
          `,
        }}
      />
      {/* Label */}
      <div className="absolute left-3 top-3 rounded bg-black/50 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-white/90 backdrop-blur-sm">
        Optical · Sentinel-2
      </div>
      {cloudCover > 60 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="rounded-md bg-black/60 px-3 py-1.5 font-mono text-xs text-amber-200/90 backdrop-blur-sm">
            Cloud-blinded · {Math.round(cloudCover)}%
          </span>
        </div>
      )}
    </div>
  );
}

/** SAR side: Kaal-Radar false-color + Yamaguchi layers + RVoG sub-canopy */
function SARCanvas({
  scattering,
  subCanopy,
  className,
}: {
  scattering: ScatteringState;
  subCanopy: boolean;
  className?: string;
}) {
  return (
    <div className={cn("relative h-full w-full overflow-hidden", className)}>
      {/* Dark SAR base */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 70% 50% at 40% 60%, #0a1a22 0%, transparent 60%),
            linear-gradient(145deg, #050d12 0%, #0c1c24 50%, #08141c 100%)
          `,
        }}
      />

      {/* Surface scattering Ps — calm water / roads (cyan-blue) */}
      {scattering.surface && (
        <>
          <div
            className="absolute left-[12%] top-[52%] h-[22%] w-[76%] rounded-[40%] opacity-70"
            style={{
              background:
                "linear-gradient(90deg, transparent, #1a8a9a 20%, #2ab0c0 50%, #1a8a9a 80%, transparent)",
              filter: "blur(6px)",
              boxShadow: "0 0 30px rgba(40,180,200,0.35)",
            }}
          />
          {/* Road-like linear features */}
          <div
            className="absolute left-[20%] top-[30%] h-[1.5px] w-[45%] rotate-[-12deg] opacity-60"
            style={{ background: "#3ac0d0", boxShadow: "0 0 8px #3ac0d0" }}
          />
        </>
      )}

      {/* Double-bounce Pd — buildings / bridge piers (red-orange) */}
      {scattering.doubleBounce && (
        <>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="absolute rounded-sm opacity-80"
              style={{
                left: `${28 + i * 12}%`,
                top: `${38 + (i % 2) * 8}%`,
                width: 10 + (i % 3) * 4,
                height: 14 + (i % 2) * 6,
                background: "linear-gradient(180deg, #e05040, #c03020)",
                boxShadow: "0 0 12px rgba(220,60,40,0.5)",
              }}
            />
          ))}
        </>
      )}

      {/* Volume scattering Pv — canopy (green) */}
      {scattering.volume && (
        <div
          className="absolute inset-[8%] rounded-full opacity-35"
          style={{
            background: `
              radial-gradient(ellipse 60% 50% at 35% 45%, #2a6a4a 0%, transparent 55%),
              radial-gradient(ellipse 50% 40% at 65% 55%, #1e5a3a 0%, transparent 50%)
            `,
            filter: "blur(12px)",
          }}
        />
      )}

      {/* Sub-canopy flood (RVoG) — dashed teal polygons under canopy */}
      {subCanopy && (
        <>
          <div
            className="absolute left-[25%] top-[42%] h-[28%] w-[50%] rounded-[30%] border-2 border-dashed border-teal-400/80 bg-teal-500/25"
            style={{ boxShadow: "0 0 24px rgba(45,180,160,0.35)" }}
          />
          <div
            className="absolute left-[18%] top-[58%] h-[15%] w-[30%] rounded-[40%] border border-dashed border-cyan-400/70 bg-cyan-500/20"
          />
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 rounded bg-teal-900/80 px-2.5 py-1 font-mono text-[10px] text-teal-200 backdrop-blur-sm">
            RVoG · Sub-canopy water detected
          </div>
        </>
      )}

      {/* Scanline cinematic overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,200,0.03) 2px, rgba(0,255,200,0.03) 4px)",
        }}
      />

      {/* Label */}
      <div className="absolute right-3 top-3 rounded bg-black/50 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-teal-300/90 backdrop-blur-sm">
        Kaal-Radar · Yamaguchi AG4U
      </div>
    </div>
  );
}

/* ─────────────────────── main component ──────────────────────── */

export function SARDualComparisonViewer({
  className,
}: {
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(50); // % from left
  const [dragging, setDragging] = useState(false);

  const [cloudCover, setCloudCover] = useState(85);
  const [scattering, setScattering] = useState<ScatteringState>({
    surface: true,
    doubleBounce: true,
    volume: true,
  });
  const [subCanopy, setSubCanopy] = useState(false);

  const toggleScattering = (key: ScatteringKey) =>
    setScattering((s) => ({ ...s, [key]: !s[key] }));

  /* pointer-driven slider */
  const updatePosition = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.max(4, Math.min(96, pct)));
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setDragging(true);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    updatePosition(e.clientX);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    updatePosition(e.clientX);
  };

  const onPointerUp = () => setDragging(false);

  return (
    <div
      className={cn(
        "relative flex h-full min-h-[320px] w-full flex-col overflow-hidden rounded-lg border border-border bg-card",
        className,
      )}
    >
      {/* ── Canvas area ── */}
      <div
        ref={containerRef}
        className="relative flex-1 select-none touch-none"
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {/* Full-width Optical (under) */}
        <OpticalCanvas cloudCover={cloudCover} className="absolute inset-0" />

        {/* Clipped SAR (over) */}
        <div
          className="absolute inset-0"
          style={{ clipPath: `inset(0 0 0 ${position}%)` }}
        >
          <SARCanvas
            scattering={scattering}
            subCanopy={subCanopy}
            className="absolute inset-0"
          />
        </div>

        {/* Divider handle */}
        <div
          className="absolute top-0 bottom-0 z-20 w-1 -translate-x-1/2 cursor-ew-resize"
          style={{ left: `${position}%` }}
          onPointerDown={onPointerDown}
        >
          <div className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-white/80 shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
          <div className="absolute left-1/2 top-1/2 flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white/90 bg-black/70 shadow-lg backdrop-blur-sm">
            <div className="flex gap-0.5">
              <div className="h-3 w-0.5 rounded-full bg-white/80" />
              <div className="h-3 w-0.5 rounded-full bg-white/80" />
            </div>
          </div>
        </div>

        {/* Side labels */}
        <div className="pointer-events-none absolute bottom-3 left-3 rounded bg-black/55 px-2 py-0.5 font-mono text-[10px] text-white/80 backdrop-blur-sm">
          ← Optical
        </div>
        <div className="pointer-events-none absolute bottom-3 right-3 rounded bg-black/55 px-2 py-0.5 font-mono text-[10px] text-teal-300/90 backdrop-blur-sm">
          SAR →
        </div>
      </div>

      {/* ── Floating toolbar ── */}
      <div className="absolute left-1/2 top-3 z-30 flex -translate-x-1/2 flex-wrap items-center justify-center gap-1.5 rounded-lg border border-border/80 bg-background/90 px-2 py-1.5 shadow-lg backdrop-blur-md">
        {/* Cloud cover */}
        <div className="flex items-center gap-1.5 px-1">
          <Cloud className="size-3.5 text-muted-foreground" />
          <input
            type="range"
            min={0}
            max={100}
            value={cloudCover}
            onChange={(e) => setCloudCover(Number(e.target.value))}
            className="h-1.5 w-20 cursor-pointer appearance-none rounded-full bg-muted accent-sage"
            title="Cloud cover simulation"
            aria-label="Cloud cover percentage"
          />
          <span className="w-8 font-mono text-[10px] tabular-nums text-muted-foreground">
            {cloudCover}%
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            className="size-7"
            onClick={() => setCloudCover((c) => (c > 50 ? 0 : 100))}
            title={cloudCover > 50 ? "Clear clouds" : "Full cloud cover"}
          >
            {cloudCover > 50 ? (
              <CloudOff className="size-3.5" />
            ) : (
              <Cloud className="size-3.5" />
            )}
          </Button>
        </div>

        <div className="mx-0.5 h-5 w-px bg-border" />

        {/* Yamaguchi layers */}
        <div className="flex items-center gap-0.5">
          <Layers className="mr-1 size-3.5 text-muted-foreground" />
          <Button
            variant={scattering.surface ? "secondary" : "ghost"}
            size="sm"
            className={cn(
              "h-7 gap-1 px-2 text-[11px]",
              scattering.surface && "border-cyan-500/50 text-cyan-400",
            )}
            onClick={() => toggleScattering("surface")}
            title="Surface scattering (Ps)"
          >
            <span className="size-2 rounded-full bg-cyan-400" />
            Pₛ
          </Button>
          <Button
            variant={scattering.doubleBounce ? "secondary" : "ghost"}
            size="sm"
            className={cn(
              "h-7 gap-1 px-2 text-[11px]",
              scattering.doubleBounce && "border-red-500/50 text-red-400",
            )}
            onClick={() => toggleScattering("doubleBounce")}
            title="Double-bounce (Pd)"
          >
            <span className="size-2 rounded-full bg-red-400" />
            P𝒹
          </Button>
          <Button
            variant={scattering.volume ? "secondary" : "ghost"}
            size="sm"
            className={cn(
              "h-7 gap-1 px-2 text-[11px]",
              scattering.volume && "border-emerald-500/50 text-emerald-400",
            )}
            onClick={() => toggleScattering("volume")}
            title="Volume scattering (Pv)"
          >
            <span className="size-2 rounded-full bg-emerald-400" />
            Pᵥ
          </Button>
        </div>

        <div className="mx-0.5 h-5 w-px bg-border" />

        {/* Sub-canopy RVoG */}
        <Button
          variant={subCanopy ? "secondary" : "ghost"}
          size="sm"
          className={cn(
            "h-7 gap-1.5 px-2.5 text-[11px]",
            subCanopy && "border-teal-500/60 text-teal-300",
          )}
          onClick={() => setSubCanopy((v) => !v)}
          title="RVoG sub-canopy flood detection"
        >
          <Waves className="size-3.5" />
          Sub-Canopy
        </Button>

        <div className="mx-0.5 h-5 w-px bg-border" />

        {/* Quick reset view */}
        <Button
          variant="ghost"
          size="icon-sm"
          className="size-7"
          onClick={() => {
            setPosition(50);
            setCloudCover(85);
            setScattering({ surface: true, doubleBounce: true, volume: true });
            setSubCanopy(false);
          }}
          title="Reset demo state"
        >
          <Radar className="size-3.5" />
        </Button>
      </div>

      {/* ── Live Metrics HUD ── */}
      <div className="absolute bottom-3 right-3 z-30 flex flex-col gap-1 rounded-md border border-border/70 bg-background/90 px-2.5 py-1.5 font-mono text-[10px] shadow-md backdrop-blur-md">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Activity className="size-3 text-sage" />
          <span>Latency</span>
          <span className="ml-auto tabular-nums text-sage">380 ms</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Gauge className="size-3 text-emerald-400" />
          <span>Accuracy</span>
          <span className="ml-auto tabular-nums text-emerald-400">97.2%</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Cpu className="size-3 text-amber-400/90" />
          <span>VRAM</span>
          <span className="ml-auto tabular-nums text-amber-400/90">1.2 GB</span>
        </div>
      </div>

      {/* ── Mode badge (top-left) ── */}
      <div className="absolute left-3 top-3 z-20 flex items-center gap-1.5 rounded bg-black/55 px-2 py-1 font-mono text-[10px] text-white/85 backdrop-blur-sm">
        <Eye className="size-3 text-sage" />
        Dual View · Kaziranga KS-FL-07
      </div>
    </div>
  );
}

export default SARDualComparisonViewer;
