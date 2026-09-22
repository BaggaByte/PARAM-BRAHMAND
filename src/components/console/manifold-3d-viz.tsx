import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Grid3x3, Maximize2, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { useConsole } from "@/lib/store";
import { MANIFOLD_BUCKETS, getChannelMeta, INDEX_LABELS } from "@/lib/engine/physics";
import { cn, formatNum } from "@/lib/utils";

interface Point3D {
  x: number;
  y: number;
  z: number;
  value: number;
  index: number;
  label?: string;
}

export function Manifold3DViz() {
  const result = useConsole((s) => s.result);
  const [activeChannel, setActiveChannel] = useState(0);
  const [rotation, setRotation] = useState({ x: 30, y: 45 });
  const [zoom, setZoom] = useState(1);
  const [is3DView, setIs3DView] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  if (!result) return null;

  const m = result.manifold;
  const p = result.physics;

  // Convert 128D manifold to 3D point cloud using PCA-like projection
  const generate3DPoints = (): Point3D[] => {
    const points: Point3D[] = [];
    
    MANIFOLD_BUCKETS.forEach((bucket, bucketIdx) => {
      const bucketData = m.slice(bucket.range[0], bucket.range[1] + 1);
      
      bucketData.forEach((value, i) => {
        const idx = bucket.range[0] + i;
        const named = INDEX_LABELS.find((x) => x.i === idx);
        
        // Project to 3D space with some variance
        const angle = (i / bucketData.length) * Math.PI * 2;
        const radius = value * 3 + bucketIdx * 0.5;
        
        points.push({
          x: Math.cos(angle) * radius + bucketIdx * 2.5,
          y: Math.sin(angle) * radius + (value - 0.5) * 2,
          z: value * 4 + bucketIdx * 0.3,
          value,
          index: idx,
          label: named?.label,
        });
      });
    });
    
    return points;
  };

  const points3D = generate3DPoints();

  // 3D Canvas rendering
  useEffect(() => {
    if (!is3DView || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    const render = () => {
      ctx.fillStyle = 'hsl(var(--background))';
      ctx.fillRect(0, 0, width, height);

      // Project 3D points to 2D
      const rotX = (rotation.x * Math.PI) / 180;
      const rotY = (rotation.y * Math.PI) / 180;

      const projected = points3D.map((point) => {
        // Rotate around Y axis
        let x = point.x * Math.cos(rotY) + point.z * Math.sin(rotY);
        let z = -point.x * Math.sin(rotY) + point.z * Math.cos(rotY);
        const y = point.y;

        // Rotate around X axis
        const y2 = y * Math.cos(rotX) - z * Math.sin(rotX);
        z = y * Math.sin(rotX) + z * Math.cos(rotX);

        // Perspective projection
        const scale = (200 / (200 + z)) * zoom;
        const x2d = centerX + x * scale * 30;
        const y2d = centerY - y2 * scale * 30;

        return {
          x: x2d,
          y: y2d,
          z: z,
          value: point.value,
          index: point.index,
          label: point.label,
          scale,
        };
      });

      // Sort by depth (z-buffer)
      projected.sort((a, b) => b.z - a.z);

      // Draw connections between nearby points
      ctx.strokeStyle = 'hsl(var(--border))';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const p1 = projected[i];
          const p2 = projected[j];
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          
          if (dist < 40) {
            ctx.globalAlpha = 0.1 * (1 - dist / 40);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // Draw points
      projected.forEach((point) => {
        const isActive = point.index === activeChannel;
        const size = (isActive ? 6 : 3) * point.scale;
        const hue = point.value * 120; // Green to red gradient

        ctx.globalAlpha = 0.7 + point.value * 0.3;
        ctx.fillStyle = isActive 
          ? 'hsl(var(--sage))' 
          : `hsl(${hue}, 70%, 55%)`;
        
        ctx.beginPath();
        ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
        ctx.fill();

        if (isActive && point.label) {
          ctx.globalAlpha = 1;
          ctx.fillStyle = 'hsl(var(--foreground))';
          ctx.font = '11px monospace';
          ctx.fillText(point.label, point.x + 10, point.y - 10);
        }
      });

      ctx.globalAlpha = 1;
      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [is3DView, rotation, zoom, activeChannel, points3D]);

  // Mouse controls
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDragging.current = true;
    lastMouse.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging.current) return;

    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;

    setRotation((prev) => ({
      x: Math.max(-90, Math.min(90, prev.x + dy * 0.5)),
      y: (prev.y + dx * 0.5) % 360,
    }));

    lastMouse.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const channelMeta = getChannelMeta(activeChannel);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <p className="font-medium text-sm text-foreground">
            Interactive 3D Manifold Visualization
          </p>
          <p className="text-xs text-muted-foreground">
            128-channel physics tensor projected into 3D space
          </p>
        </div>
        <Button
          variant={is3DView ? "default" : "outline"}
          size="sm"
          onClick={() => setIs3DView(!is3DView)}
          className="gap-1.5"
        >
          <Grid3x3 className="size-3.5" />
          {is3DView ? "2D Grid" : "3D View"}
        </Button>
      </div>

      {is3DView ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative rounded-lg border border-border bg-secondary/30 p-3"
        >
          <canvas
            ref={canvasRef}
            width={800}
            height={500}
            className="w-full h-auto rounded-md cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />

          {/* 3D Controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-1.5">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setZoom((z) => Math.min(3, z + 0.2))}
              title="Zoom in"
            >
              <ZoomIn className="size-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setZoom((z) => Math.max(0.5, z - 0.2))}
              title="Zoom out"
            >
              <ZoomOut className="size-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => {
                setRotation({ x: 30, y: 45 });
                setZoom(1);
              }}
              title="Reset view"
            >
              <RotateCcw className="size-3.5" />
            </Button>
          </div>

          {/* Active Channel Info */}
          <div className="absolute bottom-4 left-4 right-4 rounded-md border border-sage/40 bg-background/90 p-2.5 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-mono text-xs font-bold text-sage">
                Channel {channelMeta.index} · {channelMeta.name}
              </span>
              <Badge variant="outline" className="border-sage/40 text-sage text-[10px]">
                {channelMeta.bucketName.split(" ")[0]}
              </Badge>
            </div>
            <div className="text-xs font-mono text-muted-foreground">
              Value: <strong className="text-foreground">{m[activeChannel].toFixed(4)}</strong> · 
              Unit: {channelMeta.unit} · 
              Sensor: {channelMeta.sensor}
            </div>
          </div>
        </motion.div>
      ) : (
        <>
          {/* Key Invariants with Animation */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-3 sm:grid-cols-6 gap-1.5"
          >
            {[
              { k: "NDVI", v: p.ndvi },
              { k: "MNDWI", v: p.mndwi },
              { k: "OSWI", v: p.oswi },
              { k: "Pd", v: p.pd },
              { k: "Canopy", v: p.canopyHeightM },
              { k: "σ⁰VV", v: p.sigma0VvDb },
            ].map((stat, i) => (
              <motion.div
                key={stat.k}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-md border border-border bg-secondary/50 px-2 py-1.5 text-center hover:border-sage/40 hover:bg-sage/5 transition-all cursor-pointer"
              >
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  {stat.k}
                </div>
                <div className="font-mono text-xs font-bold tabular-nums text-foreground">
                  {typeof stat.v === 'number' ? formatNum(stat.v, 2) : stat.v}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Enhanced 2D Grid with animations */}
          <div className="space-y-3">
            {MANIFOLD_BUCKETS.map((bucket, bucketIdx) => (
              <motion.div
                key={bucket.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: bucketIdx * 0.1 }}
                className="rounded-md border border-border p-2 bg-card"
              >
                <div className="mb-1.5 flex items-baseline justify-between">
                  <span className="text-xs font-semibold text-foreground">{bucket.name}</span>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {bucket.range[0]}–{bucket.range[1]}
                  </span>
                </div>
                <div className="grid grid-cols-8 sm:grid-cols-16 gap-1">
                  {m.slice(bucket.range[0], bucket.range[1] + 1).map((v, i) => {
                    const idx = bucket.range[0] + i;
                    const named = INDEX_LABELS.find((x) => x.i === idx);
                    const isSelected = activeChannel === idx;
                    
                    return (
                      <motion.button
                        key={idx}
                        type="button"
                        onClick={() => setActiveChannel(idx)}
                        onMouseEnter={() => setActiveChannel(idx)}
                        whileHover={{ scale: 1.15, zIndex: 10 }}
                        whileTap={{ scale: 0.95 }}
                        title={`${named?.label ?? "ch" + idx}: ${v.toFixed(3)}`}
                        className={cn(
                          "aspect-square rounded-xs transition-all relative group focus:outline-hidden",
                          isSelected && "ring-2 ring-sage ring-offset-1 ring-offset-background scale-110 z-10",
                        )}
                        style={{
                          background: `color-mix(in oklab, var(--color-sage) ${Math.round(v * 100)}%, var(--color-secondary))`,
                        }}
                      >
                        {named && (
                          <span className="absolute inset-0 flex items-center justify-center font-mono text-[8px] font-bold text-foreground/80 pointer-events-none">
                            {named.label.slice(0, 3)}
                          </span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
                <p className="mt-1 font-mono text-[10px] text-muted-foreground">{bucket.hint}</p>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
