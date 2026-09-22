import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Flame,
  Info,
  Printer,
  ShieldAlert,
  Volume2,
  VolumeX,
  XCircle,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AGENT_BY_ID } from "@/lib/engine/agents";
import { LANG_BY_CODE } from "@/lib/engine/languages";
import {
  INDEX_LABELS,
  MANIFOLD_BUCKETS,
  getChannelMeta,
} from "@/lib/engine/physics";
import { useConsole, type RightTab } from "@/lib/store";
import { cn, formatNum } from "@/lib/utils";
import type { PhysicsViolationType } from "@/lib/engine/types";

export function ReportPanel() {
  const result = useConsole((s) => s.result);
  const running = useConsole((s) => s.running);
  const liveTrace = useConsole((s) => s.liveTrace);
  const tab = useConsole((s) => s.rightTab);
  const setTab = useConsole((s) => s.setRightTab);

  if (!result && !running) {
    return (
      <div className="flex h-full flex-col justify-center px-4 py-6">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-sage/40 text-sage font-mono">
            PS 26167
          </Badge>
          <span className="font-mono text-xs text-muted-foreground">SatQuery AI</span>
        </div>
        <p className="mt-2 font-display text-lg font-bold tracking-tight">PARAM-BRAHMAND (Vishwaroopa-AI)</p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Physics-first 7-Layer Multimodal Earth Intelligence OS for ISRO Space Applications Centre (SAC).
          Replaces black-box vision hallucinations with a 128-D invariant physical manifold, linear Geo-Mamba
          3.0 SSMs, Pearl causal calculus, and a deterministic conservation firewall.
        </p>
        <div className="mt-5 space-y-2 rounded-lg border border-border bg-secondary/50 p-3 text-xs">
          <p className="font-mono font-semibold uppercase tracking-wider text-sage">
            Eight SIH Live Pitch Case Studies:
          </p>
          <ul className="space-y-1.5 text-muted-foreground">
            <li>
              <span className="font-medium text-foreground">1. Kaziranga (Assam):</span> Sub-canopy flood under
              100% monsoon cloud via PolInSAR RVoG &amp; Pd double-bounce.
            </li>
            <li>
              <span className="font-medium text-foreground">2. Joshimath (Chamoli):</span> Millimeter crustal
              subsidence (2 mm/mo) via DInSAR phase shift before cracks.
            </li>
            <li>
              <span className="font-medium text-foreground">3. Chambal (MP/Raj):</span> Deforestation vs. wheat
              harvest disambiguation via Pearl causal SCMs (94.8% false alarm cut).
            </li>
            <li>
              <span className="font-medium text-foreground">4. Kuttanad (Kerala):</span> Below-MSL highway
              inundation with 22-language vernacular VIVA &amp; NDMA SOPs.
            </li>
            <li>
              <span className="font-medium text-foreground">5. Sundarbans (WB):</span> Mangrove bio-shield loss &amp;
              coherence decay (-62%) under NISAR L-band SAR.
            </li>
            <li>
              <span className="font-medium text-foreground">6. South Lhonak (Sikkim):</span> Glacial Lake Outburst Flood
              (GLOF) &amp; moraine subsidence alert via Cartosat-3 DEM.
            </li>
            <li>
              <span className="font-medium text-foreground">7. Delhi-NCR (NCR/Punjab):</span> Stubble fire hotspots (186
              clusters) &amp; thermal inversion via TRISHNA 8-band TIR.
            </li>
            <li>
              <span className="font-medium text-foreground">8. Degana (Rajasthan):</span> Strategic rare-earth &amp;
              lithium pegmatite detection via 200-band HyIS SAM.
            </li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as RightTab)}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="shrink-0 border-b border-border px-3 pt-3 pb-2">
          <div className="flex items-center gap-2">
            <TabsList className="flex-1">
              <TabsTrigger value="report" className="text-xs">
                <FileText className="mr-1.5 size-3.5" />
                Brief
              </TabsTrigger>
              <TabsTrigger value="trace" className="text-xs">
                Trace ({result?.trace.length ?? liveTrace.length})
              </TabsTrigger>
              <TabsTrigger value="manifold" className="text-xs">
                Manifold
              </TabsTrigger>
              <TabsTrigger value="firewall" className="text-xs">
                Firewall
              </TabsTrigger>
            </TabsList>
            {result && (
              <Button
                variant="outline"
                size="icon-sm"
                title="Export mission brief as PDF"
                aria-label="Export brief PDF"
                className="shrink-0 no-print"
                onClick={() => window.print()}
              >
                <Printer className="size-3.5" />
              </Button>
            )}
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-auto px-3 pb-4">
          <TabsContent value="report" className="mt-3">
            {result ? <Brief /> : <Pending />}
          </TabsContent>
          <TabsContent value="trace" className="mt-3">
            <TraceList />
            {running && liveTrace.length === 0 && <Pending />}
          </TabsContent>
          <TabsContent value="manifold" className="mt-3">
            {result ? <Manifold /> : <Pending />}
          </TabsContent>
          <TabsContent value="firewall" className="mt-3">
            {result ? <Firewall /> : <Pending />}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

function Pending() {
  return (
    <div className="space-y-3 py-6 text-center">
      <div className="pb-shimmer rounded-md p-4 text-sm font-medium text-sage">
        Executing 7-Layer Invariant Pipeline...
      </div>
      <p className="font-mono text-xs text-muted-foreground">
        Geo-Mamba 3.0 Linear SSM + Dharma-Chakra Physics Certification
      </p>
    </div>
  );
}

function Brief() {
  const result = useConsole((s) => s.result)!;
  const setSelectedAgentId = useConsole((s) => s.setSelectedAgentId);
  const isSpeaking = useConsole((s) => s.isSpeaking);
  const setIsSpeaking = useConsole((s) => s.setIsSpeaking);
  const agent = AGENT_BY_ID[result.agent];
  const [briefTab, setBriefTab] = useState<"summary" | "tactical" | "forensic">("summary");

  function copyText(text: string, label: string) {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  }

  function downloadGeoJSON() {
    if (!result?.geojson) return;
    const data = JSON.stringify(result.geojson, null, 2);
    const blob = new Blob([data], { type: "application/geo+json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `PARAM-BRAHMAND-${result.missionId ?? "telemetry"}-${Date.now()}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("GeoJSON vector footprint downloaded");
  }

  function toggleSpeech(text: string, lang: string) {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      toast.error("Speech synthesis not supported in this browser");
      return;
    }
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = LANG_BY_CODE[lang as keyof typeof LANG_BY_CODE]?.bcp47 ?? "en-IN";
    u.onend = () => setIsSpeaking(false);
    u.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(u);
  }

  return (
    <div className="space-y-3">
      {/* Printable ISRO SAC Letterhead (Active during window.print) */}
      <div className="hidden print:block border-b-2 border-black pb-4 mb-4 font-sans text-black">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">ISRO SPACE APPLICATIONS CENTRE (SAC)</h1>
            <p className="text-xs uppercase tracking-wider text-gray-700">Ahmedabad, Gujarat · Earth Observation Applications Division</p>
          </div>
          <div className="text-right text-xs font-mono">
            <div>PS 26167 · SatQuery AI</div>
            <div>PARAM-BRAHMAND (Vishwaroopa-AI)</div>
            <div>{new Date().toISOString()}</div>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2 text-xs border-t border-gray-300 pt-2">
          <div><strong>Mission:</strong> {result.missionId ?? "ADHOC"}</div>
          <div><strong>Target:</strong> {result.center[0].toFixed(3)}°N, {result.center[1].toFixed(3)}°E</div>
          <div><strong>Sensor Mode:</strong> {result.mapMode.toUpperCase()} ({result.physics.gsdM}m GSD)</div>
          <div><strong>Firewall Status:</strong> {result.firewall.passed ? "CERTIFIED 0% HALLUCINATION" : "VIOLATION HALT"}</div>
        </div>
      </div>

      {/* Top Status Header & Action Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setSelectedAgentId(result.agent)}
          className="group flex items-center gap-1.5 rounded-full border border-sage/40 bg-sage/10 px-2.5 py-1 text-xs font-semibold text-sage hover:bg-sage/20 transition-colors cursor-pointer"
        >
          <span>{agent.name}</span>
          <ExternalLink className="size-3 opacity-60 group-hover:opacity-100" />
        </button>
        <Badge variant={result.firewall.passed ? "pass" : "warn"}>
          {result.firewall.passed ? "Firewall: PASSED" : "Firewall: HALTED"}
        </Badge>
        <Badge variant="water">{formatNum(result.vqa.confidence * 100, 1)}% Conf.</Badge>
        <span className="font-mono text-xs text-muted-foreground">{result.latencyMs} ms</span>

        {/* Vernacular Speech Synthesizer with Animated Waveform */}
        <div className="ml-auto flex items-center gap-1.5">
          {isSpeaking && (
            <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-xs bg-sage/15 text-sage font-mono text-[10px]">
              <span className="size-1 rounded-full bg-sage animate-bounce [animation-delay:0ms]" />
              <span className="size-1.5 rounded-full bg-sage animate-bounce [animation-delay:150ms]" />
              <span className="size-2 rounded-full bg-sage animate-bounce [animation-delay:300ms]" />
              <span className="ml-1">Speaking</span>
            </div>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={isSpeaking ? "Stop speech" : "Read brief aloud"}
            onClick={() => toggleSpeech(result.report.t1, result.language)}
            className={cn("cursor-pointer", isSpeaking && "text-sage bg-sage/10 ring-1 ring-sage animate-pulse")}
            title={isSpeaking ? "Stop speech playback" : "Voice synthesize (Indic-TTS)"}
          >
            {isSpeaking ? <VolumeX className="size-4 text-destructive" /> : <Volume2 className="size-4 text-sage" />}
          </Button>
        </div>
      </div>

      {/* Action Toolbar: Export ISRO Memo & GeoJSON */}
      <div className="flex items-center gap-1.5 rounded-md border border-border/70 bg-secondary/30 p-1.5">
        <Button
          variant="outline"
          size="sm"
          onClick={downloadGeoJSON}
          className="h-7 gap-1.5 px-2.5 text-xs font-mono hover:border-sage/60 hover:text-sage cursor-pointer"
        >
          <Download className="size-3 text-sage" />
          <span>GeoJSON</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.print()}
          className="h-7 gap-1.5 px-2.5 text-xs font-mono hover:border-sage/60 hover:text-sage cursor-pointer"
        >
          <FileText className="size-3 text-sage" />
          <span>Export PDF</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => copyText(result.answer, "VQA Answer")}
          className="h-7 gap-1 px-2 text-xs ml-auto text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <Copy className="size-3" />
          <span>Copy</span>
        </Button>
      </div>

      {/* Answer Callout */}
      <div className="rounded-lg border border-border bg-card p-3 shadow-xs">
        <div className="mb-1 font-mono text-[11px] uppercase tracking-widest text-sage">
          VQA Response ({result.language.toUpperCase()})
        </div>
        <p className="text-sm leading-relaxed font-medium text-foreground">{result.answer}</p>
      </div>

      {/* Nested Brief Tabs */}
      <Tabs value={briefTab} onValueChange={(v) => setBriefTab(v as typeof briefTab)} className="space-y-3">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="summary" className="text-xs">Executive</TabsTrigger>
          <TabsTrigger value="tactical" className="text-xs">Tactical</TabsTrigger>
          <TabsTrigger value="forensic" className="text-xs">Forensic</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="mt-3 space-y-3">
          {/* Tier 1 · Brief */}
          <section className="space-y-1.5">
            <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Tier 1 · Executive Brief
            </h3>
            <div className="rounded-md border border-border/80 bg-secondary/40 p-2.5 text-sm leading-relaxed text-foreground">
              {result.report.t1}
            </div>
          </section>

          {/* GeoCP-v2 Spatial Conformal Calibration Info */}
          <div className="rounded-md border border-border bg-secondary/30 p-2.5 text-xs text-muted-foreground">
            <div className="flex items-center justify-between font-mono text-[11px] text-foreground">
              <span className="text-sage font-medium">GeoCP-v2 Conformal Calibration</span>
              <span>Coverage: {formatNum(result.geocp.coverage * 100, 1)}%</span>
            </div>
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px]">
              <span>ECE: {formatNum(result.geocp.ece * 100, 2)}%</span>
              <span>Moran&apos;s I: {formatNum(result.geocp.moranI, 2)}</span>
              <span>Zone: {result.geocp.zone}</span>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tactical" className="mt-3 space-y-3">
          {/* Tier 2 · Tactical Command */}
          <section className="space-y-1.5">
            <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Tier 2 · Tactical Operations (NDMA/SDMA)
            </h3>
            <div className="rounded-md border border-border/80 bg-secondary/40 p-2.5 text-sm leading-relaxed text-muted-foreground">
              {result.report.t2}
            </div>
          </section>

          {/* Tactical NDMA/SDMA SOP Protocol Action Card */}
          {result.ndmaSop && (
            <section className="rounded-lg border border-hazard/40 bg-hazard/5 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-hazard font-semibold text-xs">
                  <ShieldAlert className="size-4" />
                  <span>NDMA / SDMA TACTICAL PROTOCOL</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 px-2 text-xs"
                    onClick={() => copyText(result.ndmaSop!, "NDMA Tactical SOP")}
                  >
                    <Copy className="size-3" />
                    <span>Copy</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 px-2 text-xs"
                    onClick={() => window.print()}
                  >
                    <Printer className="size-3" />
                    <span>Print</span>
                  </Button>
                </div>
              </div>
              <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-xs text-foreground/90 leading-relaxed bg-background/80 p-2.5 rounded-md border border-border">
                {result.ndmaSop}
              </pre>
            </section>
          )}
        </TabsContent>

        <TabsContent value="forensic" className="mt-3 space-y-3">
          {/* Tier 3 · Forensic Inversion Trace */}
          <section className="space-y-1.5">
            <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Tier 3 · Forensic Inversion Trace (GIS/Physics)
            </h3>
            <div className="rounded-md border border-border/80 bg-secondary/40 p-2.5 text-xs font-mono leading-relaxed text-muted-foreground">
              {result.report.t3}
            </div>
          </section>

          {/* Tier 4 · Telemetry Metrics */}
          <section className="space-y-1.5">
            <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Tier 4 · Quantitative Telemetry
            </h3>
            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {result.report.t4.map((row) => (
                <div key={row.label} className="rounded-md border border-border bg-secondary/50 px-2.5 py-1.5">
                  <dt className="text-[11px] text-muted-foreground truncate">{row.label}</dt>
                  <dd className="font-mono text-xs font-semibold text-foreground truncate">{row.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TraceList() {
  const live = useConsole((s) => s.liveTrace);
  const result = useConsole((s) => s.result);
  const setSelectedLayerId = useConsole((s) => s.setSelectedLayerId);
  const steps = result?.trace ?? live;

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        Deterministic LangGraph state machine execution trace across all 7 physical layers.
      </p>
      <ol className="space-y-2">
        {steps.map((s) => (
          <li key={`${s.code}-${s.t}`} className="rounded-md border border-border bg-card p-2.5">
            <div className="flex items-baseline justify-between gap-2">
              <button
                type="button"
                onClick={() => setSelectedLayerId(s.layer)}
                className="font-mono text-xs font-semibold text-sage hover:underline flex items-center gap-1"
              >
                <span>{s.code}</span>
                <span>{s.title}</span>
                <Info className="size-3 text-sage/70" />
              </button>
              <span className="font-mono text-xs text-muted-foreground">{s.t} ms</span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{s.detail}</p>
            {s.json != null && (
              <pre className="mt-2 overflow-auto rounded-sm bg-secondary/80 p-2 font-mono text-[11px] text-muted-foreground border border-border/50">
                {JSON.stringify(s.json, null, 2)}
              </pre>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

function Manifold() {
  const result = useConsole((s) => s.result)!;
  const m = result.manifold;
  const p = result.physics;
  const [activeChannel, setActiveChannel] = useState(0);

  const channelMeta = getChannelMeta(activeChannel);
  const channelValue = m[activeChannel] ?? 0;

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <p className="font-medium text-sm text-foreground">
          Prakriti-Veda 128-D Invariant Physics Manifold
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          128-channel physical feature tensor divided into 4 specialized 32-channel invariant buckets.
          Hover or click any cell to inspect its exact mathematical derivation and sensor source.
        </p>
      </div>

      {/* Key Invariants Row */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-xs">
        <Stat k="NDVI" v={formatNum(p.ndvi)} />
        <Stat k="MNDWI" v={formatNum(p.mndwi)} />
        <Stat k="OSWI" v={formatNum(p.oswi)} />
        <Stat k="Pd" v={formatNum(p.pd)} />
        <Stat k="hv" v={`${formatNum(p.canopyHeightM, 1)}m`} />
        <Stat k="σ⁰VV" v={`${formatNum(p.sigma0VvDb, 1)}dB`} />
      </div>

      {/* Active Channel Inspector Card */}
      <div className="rounded-lg border border-sage/40 bg-secondary/70 p-3 space-y-1.5 shadow-xs">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-xs font-bold text-sage">
            Channel {channelMeta.index} / 127 · {channelMeta.name}
          </span>
          <Badge variant="outline" className="border-sage/40 text-sage text-[10px] font-mono">
            {channelMeta.bucketName.split(" ")[0]}
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div>
            <span className="text-muted-foreground text-[11px]">Normalized Value: </span>
            <span className="font-bold text-foreground">{channelValue.toFixed(4)}</span>
          </div>
          <div>
            <span className="text-muted-foreground text-[11px]">Physical Unit: </span>
            <span className="text-foreground">{channelMeta.unit}</span>
          </div>
        </div>
        <div className="rounded-sm bg-background p-2 font-mono text-xs text-sage overflow-x-auto">
          {channelMeta.formula}
        </div>
        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
          <span>Sensor: <strong className="text-foreground">{channelMeta.sensor}</strong></span>
          <span className="italic">{channelMeta.description}</span>
        </div>
      </div>

      {/* 4 Buckets Visual Matrix */}
      <div className="space-y-3">
        {MANIFOLD_BUCKETS.map((b) => (
          <div key={b.id} className="rounded-md border border-border p-2 bg-card">
            <div className="mb-1.5 flex items-baseline justify-between">
              <span className="text-xs font-semibold text-foreground">{b.name}</span>
              <span className="font-mono text-[11px] text-muted-foreground">
                Channels {b.range[0]}–{b.range[1]}
              </span>
            </div>
            <div className="grid grid-cols-8 sm:grid-cols-16 gap-1">
              {m.slice(b.range[0], b.range[1] + 1).map((v, i) => {
                const idx = b.range[0] + i;
                const named = INDEX_LABELS.find((x) => x.i === idx);
                const isSelected = activeChannel === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveChannel(idx)}
                    onMouseEnter={() => setActiveChannel(idx)}
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
                  </button>
                );
              })}
            </div>
            <p className="mt-1 font-mono text-[10px] text-muted-foreground">{b.hint}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-md border border-border bg-secondary/50 px-2 py-1.5 text-center">
      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{k}</div>
      <div className="font-mono text-xs font-bold tabular-nums text-foreground">{v}</div>
    </div>
  );
}

function Firewall() {
  const result = useConsole((s) => s.result)!;
  const fw = result.firewall;
  const p = result.physics;
  const submit = useConsole((s) => s.submit);
  const running = useConsole((s) => s.running);
  const physicsViolation = useConsole((s) => s.physicsViolation);
  const setPhysicsViolation = useConsole((s) => s.setPhysicsViolation);

  function triggerViolation(v: PhysicsViolationType) {
    setPhysicsViolation(v);
    void submit(undefined, v);
  }

  return (
    <div className="space-y-3">
      {/* Firewall Gate Status */}
      <div
        className={cn(
          "rounded-lg border p-3 flex items-start gap-3",
          fw.passed
            ? "border-sage/40 bg-sage/10 text-sage"
            : "border-hazard/50 bg-hazard/10 text-hazard",
        )}
      >
        {fw.passed ? (
          <CheckCircle2 className="size-5 shrink-0 mt-0.5" />
        ) : (
          <XCircle className="size-5 shrink-0 mt-0.5" />
        )}
        <div>
          <p className="font-bold text-sm">
            {fw.passed
              ? "Dharma-Chakra Physics Gatekeeper: CERTIFIED"
              : "Dharma-Chakra Physics Gatekeeper: REJECTED"}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
            {fw.passed
              ? "All 4 invariant deterministic physical conservation laws verified. 0% hallucination guaranteed."
              : "Prediction halted because one or more physical conservation laws were violated."}
          </p>
        </div>
      </div>

      {/* The 4 Invariant Postulates */}
      <div className="space-y-1.5">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Four Invariant Deterministic Postulates
        </p>
        <ul className="space-y-1.5">
          {fw.postulates.map((x) => (
            <li key={x.id} className="rounded-md border border-border bg-card p-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-foreground">{x.name}</span>
                <Badge variant={x.passed ? "pass" : "warn"}>
                  {x.passed ? "PASSED" : "REJECTED"}
                </Badge>
              </div>
              <p className="mt-1 font-mono text-[11px] text-muted-foreground leading-relaxed">
                {x.detail}
              </p>
            </li>
          ))}
        </ul>
      </div>

      {/* Live Hallucination Stress-Tester for SIH Jury */}
      <div className="rounded-lg border border-border bg-secondary/40 p-3 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <Zap className="size-3.5 text-sage" />
          <span>Interactive Hallucination Stress-Tester (Live Jury Demo)</span>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Intentionally inject unphysical predictions into the pipeline to test whether the Dharma-Chakra
          firewall deterministically halts hallucinations:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
          <Button
            size="sm"
            variant={physicsViolation === "none" ? "default" : "outline"}
            disabled={running}
            onClick={() => triggerViolation("none")}
            className="text-xs h-8 justify-start"
          >
            <CheckCircle2 className="size-3.5 text-sage mr-1.5 shrink-0" />
            <span>Normal Physics (Pass)</span>
          </Button>
          <Button
            size="sm"
            variant={physicsViolation === "hydro" ? "destructive" : "outline"}
            disabled={running}
            onClick={() => triggerViolation("hydro")}
            className="text-xs h-8 justify-start"
          >
            <AlertTriangle className="size-3.5 mr-1.5 shrink-0 text-hazard" />
            <span>Water on 21.8° Slope</span>
          </Button>
          <Button
            size="sm"
            variant={physicsViolation === "stokes" ? "destructive" : "outline"}
            disabled={running}
            onClick={() => triggerViolation("stokes")}
            className="text-xs h-8 justify-start"
          >
            <Flame className="size-3.5 mr-1.5 shrink-0 text-hazard" />
            <span>Stokes Energy Violation</span>
          </Button>
          <Button
            size="sm"
            variant={physicsViolation === "specular" ? "destructive" : "outline"}
            disabled={running}
            onClick={() => triggerViolation("specular")}
            className="text-xs h-8 justify-start"
          >
            <AlertTriangle className="size-3.5 mr-1.5 shrink-0 text-hazard" />
            <span>SAR Specular Inversion</span>
          </Button>
        </div>
      </div>

      {/* Physics State Telemetry */}
      <div className="rounded-md border border-border bg-secondary/30 p-2.5 font-mono text-[11px] text-muted-foreground space-y-1">
        <div>Class: <strong className="text-foreground">{p.predictedClass.replaceAll("_", " ")}</strong></div>
        <div>DEM Slope: <strong className="text-foreground">{formatNum(p.slopeDeg, 1)}°</strong> (Limit: ≤ 5.0°)</div>
        <div>Total Tr(T₃): <strong className="text-foreground">{formatNum(p.traceT3, 3)}</strong> vs Incident: <strong className="text-foreground">{formatNum(p.iIncident, 3)}</strong></div>
        <div>Albedo (α): <strong className="text-foreground">{formatNum(p.albedo, 2)}</strong> ∈ [0.0, 1.0]</div>
      </div>
    </div>
  );
}
