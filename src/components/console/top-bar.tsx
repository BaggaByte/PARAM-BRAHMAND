import { Globe, Info, RotateCcw, ShieldAlert } from "lucide-react";
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

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background px-3 md:px-4">
      <button
        type="button"
        className="flex min-w-0 items-center gap-2.5 text-left"
        onClick={() => setAboutOpen(true)}
      >
        <Mark className="size-7 shrink-0 text-sage" />
        <span className="min-w-0">
          <span className="block truncate font-display text-sm font-semibold leading-tight tracking-tight">
            PARAM-BRAHMAND
          </span>
          <span className="hidden truncate text-xs text-muted-foreground sm:block">
            परम-ब्रह्माण्ड · ISRO SAC
          </span>
        </span>
      </button>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <span className="hidden items-center gap-1.5 rounded-full border border-border bg-card/60 px-2 py-0.5 font-mono text-[11px] text-muted-foreground lg:inline-flex">
          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>7-Layer OS Active</span>
        </span>
        {result && (
          <span className="hidden items-center gap-2 font-mono text-xs text-muted-foreground md:flex">
            <span className="text-sage">{result.latencyMs} ms</span>
            <span aria-hidden="true">·</span>
            <span>{result.firewall.passed ? "DHARMA PASS" : "DHARMA HALT"}</span>
          </span>
        )}
        {running && (
          <span className="font-mono text-xs text-sage">INFERENCE</span>
        )}

        {/* Physics Violation Selector — Dharma Firewall Demo */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              id="physics-violation-selector"
              variant={physicsViolation !== "none" ? "destructive" : "outline"}
              size="sm"
              className="gap-1.5"
              title="Physics Violation Selector — Dharma Firewall Demo"
            >
              <ShieldAlert className="size-3.5" />
              <span className="hidden sm:inline">
                {physicsViolation !== "none" ? activeViolation?.label : "Firewall"}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel className="font-mono text-xs text-muted-foreground">
              Dharma Firewall — Inject Physics Violation
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {VIOLATION_OPTIONS.map((opt) => (
              <DropdownMenuItem
                key={opt.value}
                id={`violation-${opt.value}`}
                onSelect={() => setPhysicsViolation(opt.value)}
                className="flex flex-col items-start gap-0.5"
              >
                <span className={opt.value !== "none" ? "text-destructive font-medium" : "font-medium"}>
                  {opt.label}
                </span>
                <span className="text-xs text-muted-foreground">{opt.desc}</span>
                {physicsViolation === opt.value && (
                  <span className="ml-auto text-xs text-sage">✓ active</span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Globe className="size-3.5" />
              <span className="hidden sm:inline">{lang?.native ?? "English"}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {LANGUAGES.map((l) => (
              <DropdownMenuItem
                key={l.code}
                onSelect={() => setLanguage(l.code)}
                className="justify-between"
              >
                <span>{l.native}</span>
                <span className="text-xs text-muted-foreground">{l.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="ghost" size="icon-sm" onClick={() => setAboutOpen(true)} aria-label="About">
          <Info className="size-4" />
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={reset} aria-label="Reset view">
          <RotateCcw className="size-4" />
        </Button>
      </div>
    </header>
  );
}
