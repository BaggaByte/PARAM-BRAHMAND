import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Activity, TrendingUp, Zap } from "lucide-react";
import { useConsole } from "@/lib/store";
import { Badge } from "@/components/ui/badge";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface TelemetryPoint {
  timestamp: number;
  confidence: number;
  latency: number;
  physicsScore: number;
}

export function LiveTelemetryCharts() {
  const result = useConsole((s) => s.result);
  const running = useConsole((s) => s.running);
  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryPoint[]>([]);
  const [liveLatency, setLiveLatency] = useState(0);

  // Simulate live telemetry data during analysis
  useEffect(() => {
    if (!running) return;

    const interval = setInterval(() => {
      setLiveLatency((prev) => {
        const newLatency = Math.min(3000, prev + Math.random() * 150);
        return newLatency;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [running]);

  // Add result to history
  useEffect(() => {
    if (!result) return;

    const newPoint: TelemetryPoint = {
      timestamp: Date.now(),
      confidence: result.vqa.confidence,
      latency: result.latencyMs,
      physicsScore: result.firewall.passed ? 1.0 : 0.6,
    };

    setTelemetryHistory((prev) => {
      const updated = [...prev, newPoint].slice(-20); // Keep last 20 points
      return updated;
    });
    setLiveLatency(0);
  }, [result]);

  if (telemetryHistory.length === 0 && !running) {
    return (
      <div className="rounded-lg border border-border bg-secondary/30 p-6 text-center">
        <Activity className="size-8 mx-auto mb-2 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">
          Telemetry charts will appear after first analysis
        </p>
      </div>
    );
  }

  const labels = telemetryHistory.map((_, i) => `Q${i + 1}`);
  const currentLatency = running ? liveLatency : telemetryHistory[telemetryHistory.length - 1]?.latency || 0;

  const confidenceData = {
    labels: running ? [...labels, 'LIVE'] : labels,
    datasets: [
      {
        label: 'Confidence',
        data: running 
          ? [...telemetryHistory.map(p => p.confidence * 100), Math.random() * 20 + 60]
          : telemetryHistory.map(p => p.confidence * 100),
        borderColor: 'hsl(var(--sage))',
        backgroundColor: 'hsla(var(--sage) / 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const latencyData = {
    labels: running ? [...labels, 'LIVE'] : labels,
    datasets: [
      {
        label: 'Latency (ms)',
        data: running
          ? [...telemetryHistory.map(p => p.latency), currentLatency]
          : telemetryHistory.map(p => p.latency),
        borderColor: 'hsl(var(--chart-3))',
        backgroundColor: 'hsla(var(--chart-3) / 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const physicsData = {
    labels: running ? [...labels, 'LIVE'] : labels,
    datasets: [
      {
        label: 'Physics Score',
        data: running
          ? [...telemetryHistory.map(p => p.physicsScore), 0.8 + Math.random() * 0.2]
          : telemetryHistory.map(p => p.physicsScore),
        borderColor: 'hsl(var(--chart-1))',
        backgroundColor: 'hsla(var(--chart-1) / 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'hsl(var(--background))',
        titleColor: 'hsl(var(--foreground))',
        bodyColor: 'hsl(var(--muted-foreground))',
        borderColor: 'hsl(var(--border))',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: {
          color: 'hsla(var(--border) / 0.3)',
        },
        ticks: {
          color: 'hsl(var(--muted-foreground))',
          font: {
            size: 10,
            family: 'monospace',
          },
        },
      },
      y: {
        grid: {
          color: 'hsla(var(--border) / 0.3)',
        },
        ticks: {
          color: 'hsl(var(--muted-foreground))',
          font: {
            size: 10,
            family: 'monospace',
          },
        },
      },
    },
    animation: {
      duration: running ? 750 : 0,
    },
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Activity className="size-4 text-sage" />
        <h3 className="font-semibold text-sm">Live Telemetry Dashboard</h3>
        {running && (
          <Badge variant="default" className="ml-auto gap-1 animate-pulse">
            <Zap className="size-3" />
            LIVE
          </Badge>
        )}
      </div>

      {/* Confidence Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg border border-border bg-card p-3"
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="font-mono text-xs font-semibold text-foreground">
            VQA Confidence Score
          </span>
          <span className="font-mono text-xs text-sage">
            {result && `${(result.vqa.confidence * 100).toFixed(1)}%`}
          </span>
        </div>
        <div className="h-32">
          <Line data={confidenceData} options={{ ...chartOptions, scales: { ...chartOptions.scales, y: { ...chartOptions.scales.y, min: 0, max: 100 } } }} />
        </div>
      </motion.div>

      {/* Latency Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-lg border border-border bg-card p-3"
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="font-mono text-xs font-semibold text-foreground">
            Pipeline Latency
          </span>
          <span className="font-mono text-xs text-chart-3">
            {running ? `${Math.round(currentLatency)}ms` : result && `${result.latencyMs}ms`}
          </span>
        </div>
        <div className="h-32">
          <Line data={latencyData} options={chartOptions} />
        </div>
      </motion.div>

      {/* Physics Integrity Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-lg border border-border bg-card p-3"
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="font-mono text-xs font-semibold text-foreground">
            Physics Integrity Score
          </span>
          <span className="font-mono text-xs text-chart-1">
            {result && (result.firewall.passed ? "1.00" : "0.60")}
          </span>
        </div>
        <div className="h-32">
          <Line data={physicsData} options={{ ...chartOptions, scales: { ...chartOptions.scales, y: { ...chartOptions.scales.y, min: 0, max: 1 } } }} />
        </div>
      </motion.div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-md border border-border bg-secondary/50 p-2 text-center">
          <TrendingUp className="size-3.5 mx-auto mb-1 text-sage" />
          <div className="font-mono text-xs text-muted-foreground">Avg Confidence</div>
          <div className="font-mono text-sm font-bold text-foreground">
            {telemetryHistory.length > 0 
              ? (telemetryHistory.reduce((sum, p) => sum + p.confidence, 0) / telemetryHistory.length * 100).toFixed(1)
              : "—"}%
          </div>
        </div>
        <div className="rounded-md border border-border bg-secondary/50 p-2 text-center">
          <Zap className="size-3.5 mx-auto mb-1 text-chart-3" />
          <div className="font-mono text-xs text-muted-foreground">Avg Latency</div>
          <div className="font-mono text-sm font-bold text-foreground">
            {telemetryHistory.length > 0
              ? Math.round(telemetryHistory.reduce((sum, p) => sum + p.latency, 0) / telemetryHistory.length)
              : "—"}ms
          </div>
        </div>
        <div className="rounded-md border border-border bg-secondary/50 p-2 text-center">
          <Activity className="size-3.5 mx-auto mb-1 text-chart-1" />
          <div className="font-mono text-xs text-muted-foreground">Total Queries</div>
          <div className="font-mono text-sm font-bold text-foreground">
            {telemetryHistory.length}
          </div>
        </div>
      </div>
    </div>
  );
}
