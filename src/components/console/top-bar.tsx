import { useEffect, useState } from "react";
import { Globe, Info, RotateCcw, ShieldAlert, Sparkles } from "lucide-react";

import { LANGUAGES } from "@/lib/engine/languages";
import { useConsole } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Mark } from "./logo";
import { HelpButton } from "./onboarding-guide";
import { DatasetInfo } from "./dataset-info";
import type { PhysicsViolationType } from "@/lib/engine/types";

const VIOLATION_OPTIONS: { value: PhysicsViolationType; label: string; desc: string }[] = [
  { value: "none",     label: "No Violation",         desc: "Normal certified mode"         },
  { value: "stokes",   label: "Stokes Violation",      desc: "Polarisation energy overflow"  },
  { value: "hydro",    label: "Hydro Violation",       desc: "Water on impossible slope"     },
  { value: "specular", label: "Specular Violation",    desc: "Fresnel angle out of range"    },
  { value: "albedo",   label: "Albedo Violation",      desc: "Reflectance > 1 (impossible)"  },
];

export function TopBar() {
  const language = useConsole((s) => s.language);
  const setLanguage = useConsole((s) => s.setLanguage);
  const result = useConsole((s) => s.result);
  const running = useConsole((s) => s.running);
  const reset = useConsole((s) => s.reset);
  const setAboutOpen = useConsole((s) => s.setAboutOpen);
  const physicsViolation = useConsole((s) => s.physicsViolation);
  const setPhysicsViolation = useConsole((s) => s.setPhysicsViolation);
  const lang = LANGUAGES.find((l) => l.code === language);
  const activeViolation = VIOLATION_OPTIONS.find((v) => v.value === physicsViolation);

  // Live IST clock
  const [istTime, setIstTime] = useState(() => new Date());
  useEffect(() => {
    const t = window.setInterval(() => setIstTime(new Date()), 1000);
    return () => window.clearInterval(t);
  }, []);
  const istStr = istTime.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour12: false });

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 bg-gradient-to-b from-background/80 to-transparent px-4 md:px-6">
      <button
        type="button"
        className="flex min-w-0 items-center gap-3 text-left hover:scale-105 transition-transform"
        onClick={() => setAboutOpen(true)}
      >
        <div className="rounded-full bg-primary/20 p-1.5 backdrop-blur-md border border-primary/30">
          <Mark className="size-6 shrink-0 text-primary" />
        </div>
        <span className="min-w-0">
          <span className="block truncate font-display text-lg font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent drop-shadow-md">
            PARAM-BRAHMAND
          </span>
          <span className="hidden truncate font-mono text-[10px] text-muted-foreground sm:block tracking-widest uppercase">
            Earth Intelligence OS
          </span>
        </span>
      </button>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <DatasetInfo />
        
        <span className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-background/50 backdrop-blur-md px-3 py-1 font-mono text-xs text-primary lg:inline-flex shadow-sm">
          <span className="size-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(0,210,255,0.8)]" />
          <span>7-Layer OS</span>
          <span className="text-muted-foreground/40 px-1">|</span>
          <span className="tabular-nums font-semibold">{istStr}</span>
        </span>
        
        {result && (
          <span className="hidden items-center gap-2 font-mono text-xs text-muted-foreground md:flex">
            <span className="text-primary font-bold">{result.latencyMs}ms</span>
            <span aria-hidden="true">·</span>
            <span className={result.firewall.passed ? "text-green-400" : "text-destructive"}>
              {result.firewall.passed ? "DHARMA PASS" : "DHARMA HALT"}
            </span>
          </span>
        )}

        {/* Physics Violation Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              id="physics-violation-selector"
              variant={physicsViolation !== "none" ? "destructive" : "outline"}
              size="sm"
              className="gap-2 rounded-full bg-background/50 backdrop-blur border-white/10"
              title="Physics Violation Selector"
            >
              <ShieldAlert className="size-4" />
              <span className="hidden sm:inline">
                {physicsViolation !== "none" ? activeViolation?.label : "Firewall"}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 bg-background/95 backdrop-blur-xl border-white/10 rounded-2xl glass-morphism">
            <DropdownMenuLabel className="font-mono text-xs text-muted-foreground">
              Dharma Firewall — Inject Violation
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/10" />
            {VIOLATION_OPTIONS.map((opt) => (
              <DropdownMenuItem
                key={opt.value}
                id={`violation-${opt.value}`}
                onSelect={() => setPhysicsViolation(opt.value)}
                className="flex flex-col items-start gap-1 rounded-xl cursor-pointer hover:bg-white/5 focus:bg-white/5"
              >
                <span className={opt.value !== "none" ? "text-destructive font-semibold" : "font-semibold"}>
                  {opt.label}
                </span>
                <span className="text-xs text-muted-foreground">{opt.desc}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 rounded-full bg-background/50 backdrop-blur border-white/10">
              <Globe className="size-4" />
              <span className="hidden sm:inline">{lang?.native ?? "English"}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-background/95 backdrop-blur-xl border-white/10 rounded-2xl glass-morphism">
            {LANGUAGES.map((l) => (
              <DropdownMenuItem
                key={l.code}
                onSelect={() => setLanguage(l.code)}
                className="justify-between rounded-xl cursor-pointer hover:bg-white/5 focus:bg-white/5"
              >
                <span className="font-medium">{l.native}</span>
                <span className="text-xs text-muted-foreground font-mono">{l.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10" onClick={() => setAboutOpen(true)} aria-label="About" title="About this system">
          <Info className="size-5" />
        </Button>
        <HelpButton />
        <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10" onClick={reset} aria-label="Reset view" title="Reset and start over">
          <RotateCcw className="size-5" />
        </Button>
      </div>
    </header>
  );
}
