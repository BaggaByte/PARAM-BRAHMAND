import { useEffect, useRef } from "react";
import { Howl } from "howler";
import { useConsole } from "@/lib/store";

// Sound effects for different mission events
const SOUNDS = {
  startup: {
    src: ['/sounds/startup.mp3'],
    volume: 0.3,
    sprite: undefined
  },
  analysis: {
    src: ['/sounds/analysis.mp3'],
    volume: 0.2,
    sprite: undefined
  },
  alert: {
    src: ['/sounds/alert.mp3'],
    volume: 0.4,
    sprite: undefined
  },
  success: {
    src: ['/sounds/success.mp3'],
    volume: 0.3,
    sprite: undefined
  },
  satellite: {
    src: ['/sounds/satellite.mp3'],
    volume: 0.15,
    loop: true,
    sprite: undefined
  },
  radar: {
    src: ['/sounds/radar-ping.mp3'],
    volume: 0.25,
    sprite: undefined
  }
};

// Create synthetic sounds using Web Audio API as fallback
function createSyntheticSound(type: 'beep' | 'whoosh' | 'ping' | 'scan'): Howl {
  // For now, return a silent Howl - in production, you'd generate these
  return new Howl({ src: ['data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA='], volume: 0 });
}

export function SoundManager() {
  const running = useConsole((s) => s.running);
  const result = useConsole((s) => s.result);
  const soundsRef = useRef<Record<string, Howl>>({});
  const prevRunning = useRef(running);
  const prevResult = useRef(result);

  useEffect(() => {
    // Initialize sound library with synthetic sounds
    soundsRef.current = {
      startup: createSyntheticSound('whoosh'),
      analysis: createSyntheticSound('scan'),
      alert: createSyntheticSound('beep'),
      success: createSyntheticSound('ping'),
      satellite: createSyntheticSound('scan'),
      radar: createSyntheticSound('ping'),
    };

    return () => {
      Object.values(soundsRef.current).forEach(sound => sound.unload());
    };
  }, []);

  useEffect(() => {
    // Play analysis sound when query starts
    if (running && !prevRunning.current) {
      soundsRef.current.analysis?.play();
    }
    prevRunning.current = running;
  }, [running]);

  useEffect(() => {
    // Play success sound when results arrive
    if (result && !prevResult.current) {
      soundsRef.current.success?.play();
      
      // Play alert if firewall violation detected
      if (!result.firewall.passed) {
        setTimeout(() => {
          soundsRef.current.alert?.play();
        }, 500);
      }
    }
    prevResult.current = result;
  }, [result]);

  return null;
}
