import { Globe, Info, RotateCcw } from "lucide-react";
import { LANGUAGES } from "@/lib/engine/languages";
import { useConsole } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Mark } from "./logo";

export function TopBar() {
  const language = useConsole((s) => s.language);
  const setLanguage = useConsole((s) => s.setLanguage);
  const result = useConsole((s) => s.result);
  const running = useConsole((s) => s.running);
  const reset = useConsole((s) => s.reset);
  const setAboutOpen = useConsole((s) => s.setAboutOpen);
  const lang = LANGUAGES.find((l) => l.code === language);

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
