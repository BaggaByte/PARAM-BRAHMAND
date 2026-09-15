import { useEffect, useState } from "react";
import { LAYERS } from "@/lib/engine/agents";
import { useConsole } from "@/lib/store";
import { Mark } from "./logo";

const EXTRA = [
  { k: "COG", v: "HTTP range streamer" },
  { k: "SIRTI", v: "GSD token injection" },
  { k: "VIVA", v: "22 scheduled languages" },
];

export function BootScreen() {
  const setBooted = useConsole((s) => s.setBooted);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("pb.booted") === "1") {
        setBooted(true);
        return;
      }
    } catch {
      /* ignore */
    }
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      finish();
      return;
    }
    const id = window.setInterval(() => setTick((t) => t + 1), 180);
    const done = window.setTimeout(finish, 2000);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(done);
    };

    function finish() {
      try {
        sessionStorage.setItem("pb.booted", "1");
      } catch {
        /* ignore */
      }
      setBooted(true);
    }
  }, [setBooted]);

  return (
    <button
      type="button"
      onClick={() => {
        try {
          sessionStorage.setItem("pb.booted", "1");
        } catch {
          /* ignore */
        }
        setBooted(true);
      }}
      className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-background px-6 text-left"
    >
      <div className="w-full max-w-md">
        <div className="pb-boot-row flex items-center gap-3" style={{ animationDelay: "0ms" }}>
          <Mark className="size-10 text-sage" />
          <div>
            <p className="font-display text-2xl font-semibold tracking-tight text-foreground">
              PARAM-BRAHMAND
            </p>
            <p className="text-sm text-muted-foreground">परम-ब्रह्माण्ड · Earth Intelligence OS</p>
          </div>
        </div>
        <p
          className="pb-boot-row mt-6 font-mono text-xs uppercase tracking-widest text-muted-foreground"
          style={{ animationDelay: "80ms" }}
        >
          ISRO SAC · PS 26167 · SatQuery AI
        </p>
        <ul className="mt-8 space-y-1.5 font-mono text-xs">
          {LAYERS.map((l, i) => {
            const on = tick > i + 2;
            return (
              <li
                key={l.id}
                className="pb-boot-row flex items-center justify-between gap-4"
                style={{ animationDelay: `${120 + i * 40}ms` }}
              >
                <span className="text-muted-foreground">
                  {l.code} {l.name}
                </span>
                <span className={on ? "text-sage" : "text-muted-foreground/50"}>
                  {on ? "ONLINE" : "INIT"}
                </span>
              </li>
            );
          })}
          {EXTRA.map((row, i) => (
            <li
              key={row.k}
              className="pb-boot-row flex items-center justify-between gap-4"
              style={{ animationDelay: `${400 + i * 40}ms` }}
            >
              <span className="text-muted-foreground">
                {row.k} {row.v}
              </span>
              <span className={tick > 9 + i ? "text-sage" : "text-muted-foreground/50"}>
                {tick > 9 + i ? "ONLINE" : "INIT"}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-10 text-xs text-muted-foreground">Skip</p>
      </div>
    </button>
  );
}
