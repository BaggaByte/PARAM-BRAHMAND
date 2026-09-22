import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { LAYERS } from "@/lib/engine/agents";
import { useConsole } from "@/lib/store";
import { Mark } from "./logo";

export function AboutDialog() {
  const open = useConsole((s) => s.aboutOpen);
  const setOpen = useConsole((s) => s.setAboutOpen);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[2000] bg-background/80 backdrop-blur-xs" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[2001] max-h-[min(36rem,88dvh)] w-[min(36rem,calc(100%-1.5rem))] -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-xl border border-border bg-card p-5 text-card-foreground shadow-2xl">
          <div className="flex items-start gap-3 pr-8">
            <Mark className="size-8 text-sage" />
            <div>
              <Dialog.Title className="font-display text-lg font-semibold tracking-tight">
                PARAM-BRAHMAND
              </Dialog.Title>
              <Dialog.Description className="text-sm text-muted-foreground">
                परम-ब्रह्माण्ड · physics-first Earth intelligence for ISRO SAC SatQuery AI (PS
                26167).
              </Dialog.Description>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Black-box vision models hallucinate water on ridgelines. This console replaces that
            with a 128-D invariant manifold, linear state-space tiles, nine specialist agents,
            spatial conformal calibration, and a hard conservation firewall.
          </p>
          <ol className="mt-4 space-y-2">
            {LAYERS.map((l) => (
              <li key={l.id} className="flex gap-3 text-sm">
                <span className="w-8 shrink-0 font-mono text-xs text-sage">{l.code}</span>
                <span>
                  <span className="font-medium">{l.name}</span>
                  <span className="block text-xs text-muted-foreground">{l.role}</span>
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-5 font-mono text-xs text-muted-foreground">
            TensorTitans · Smart India Hackathon 2026 · keys 1–8 load missions · / focuses query
          </p>
          <Dialog.Close className="absolute right-3 top-3 rounded-sm p-1 text-muted-foreground hover:text-foreground">
            <X className="size-4" />
            <span className="sr-only">Close</span>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
