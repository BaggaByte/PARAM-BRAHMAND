import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Radio, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LANG_BY_CODE } from "@/lib/engine/languages";
import { MISSIONS } from "@/lib/engine/missions";
import { useConsole } from "@/lib/store";

type Recog = {
  start: () => void;
  stop: () => void;
  abort: () => void;
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((ev: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

function getRecog(): Recog | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => Recog;
    webkitSpeechRecognition?: new () => Recog;
  };
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

export function QueryBar() {
  const query = useConsole((s) => s.query);
  const setQuery = useConsole((s) => s.setQuery);
  const submit = useConsole((s) => s.submit);
  const running = useConsole((s) => s.running);
  const language = useConsole((s) => s.language);
  const inputRef = useRef<HTMLInputElement>(null);
  const [listening, setListening] = useState(false);
  const recRef = useRef<Recog | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") inputRef.current?.blur();
      const numKey = Number(e.key);
      if (numKey >= 1 && numKey <= MISSIONS.length && document.activeElement?.tagName !== "INPUT") {
        const m = MISSIONS[numKey - 1];
        if (m) void useConsole.getState().loadMission(m.id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function toggleMic() {
    if (listening) {
      recRef.current?.stop();
      setListening(false);
      return;
    }
    const rec = getRecog();
    if (!rec) {
      toast("Voice capture is not available in this browser. Please use text input.");
      return;
    }
    rec.lang = LANG_BY_CODE[language]?.bcp47 ?? "en-IN";
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (ev) => {
      const said = ev.results[0]?.[0]?.transcript ?? "";
      if (said) {
        setQuery(said);
        setListening(false);
        void submit(said);
      }
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recRef.current = rec;
    try {
      rec.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  }

  // Language-specific placeholder hints
  const hints: Record<string, string> = {
    hi: "क्या बाढ़ का पानी हाईवे तक पहुँच गया है?",
    as: "কাজিৰঙাত গছৰ তলৰ বানপानी দেখুৱাওক",
    ml: "ഹൈവേ വെള്ളത്തിനടിയിലായോ?",
    mr: "चंबळ काठावरील बदल वृक्षतोड आहे की कापणी?",
    bn: "বন্যার জল কি হাইওয়ে পর্যন্ত পৌঁছেছে?",
    ta: "வெள்ள நீர் நெடுஞ்சாலையை அடைந்துவிட்டதா?",
    te: "వరద నీరు హైవే వరకు చేరిందా?",
    en: "Query satellite telemetry (e.g. 'Map flood water under canopy in Kaziranga')",
  };
  const hint = hints[language] ?? hints.en;

  // Quick suggestion chips matching the active language
  const suggestions = MISSIONS.map((m) => {
    const s = m.samples.find((x) => x.lang === language) ?? m.samples[0];
    return { title: m.title.split(" ")[0], text: s.text };
  });

  return (
    <div className="space-y-1.5">
      {/* Voice listening active wave banner */}
      {listening && (
        <div className="flex items-center gap-2 rounded-md border border-sage/40 bg-sage/10 px-3 py-1.5 text-xs text-sage animate-pulse font-mono">
          <Radio className="size-3.5 animate-spin" />
          <span>Listening in {LANG_BY_CODE[language]?.native ?? "English"} (IndicConformer)... Speak your satellite query now</span>
          <div className="ml-auto flex items-center gap-0.5">
            <span className="size-1 bg-sage rounded-full animate-bounce [animation-delay:0ms]" />
            <span className="size-1.5 bg-sage rounded-full animate-bounce [animation-delay:150ms]" />
            <span className="size-2 bg-sage rounded-full animate-bounce [animation-delay:300ms]" />
          </div>
        </div>
      )}

      <form
        className="flex items-center gap-3 bg-card/40 p-2 rounded-3xl border border-white/10 shadow-inner backdrop-blur-md"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={hint}
            aria-label="Satellite query"
            disabled={running}
            className="h-12 md:h-14 w-full bg-transparent border-none px-4 md:px-6 font-sans text-base md:text-lg text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-0 shadow-none"
          />
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 font-mono text-xs text-muted-foreground/40 hidden sm:inline">
            Press / to search
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2 pr-2">
          <Button
            type="button"
            variant={listening ? "default" : "ghost"}
            size="icon"
            onClick={toggleMic}
            aria-label={listening ? "Stop listening" : "Voice query"}
            title={listening ? "Stop listening" : "Vernacular voice query (AI4Bharat VIVA)"}
            className={`rounded-full size-10 md:size-12 transition-all ${
              listening 
                ? "bg-sage text-background hover:bg-sage/90 ring-4 ring-sage/30 animate-pulse" 
                : "text-muted-foreground hover:bg-white/10 hover:text-foreground"
            }`}
          >
            {listening ? <MicOff className="size-5" /> : <Mic className="size-5" />}
          </Button>
          <Button
            type="submit"
            size="icon"
            disabled={running || !query.trim()}
            aria-label="Run query"
            className="rounded-full size-10 md:size-12 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
          >
            <Send className="size-5" />
          </Button>
        </div>
      </form>

      {/* Vernacular Quick Suggestion Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pt-0.5 scrollbar-none">
        <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground shrink-0">
          <Sparkles className="size-2.5 text-sage" />
          <span>Quick:</span>
        </span>
        {suggestions.map((s, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setQuery(s.text);
              void submit(s.text);
            }}
            disabled={running}
            className="truncate rounded-xs border border-border/80 bg-secondary/50 px-2 py-0.5 font-sans text-[11px] text-muted-foreground hover:border-sage/50 hover:bg-secondary hover:text-foreground transition-colors shrink-0 max-w-[200px]"
          >
            {s.text}
          </button>
        ))}
      </div>
    </div>
  );
}
