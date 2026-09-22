import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/console/app-shell";
import { IntroSplash } from "@/components/IntroSplash";
import { useConsole } from "@/lib/store";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const introSplashOpen = useConsole((s) => s.introSplashOpen);
  const setIntroSplashOpen = useConsole((s) => s.setIntroSplashOpen);

  return (
    <>
      {introSplashOpen && (
        <IntroSplash onComplete={() => setIntroSplashOpen(false)} />
      )}
      <AppShell />
    </>
  );
}

