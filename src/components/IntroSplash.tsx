import { useRef, useState, useCallback } from "react";

interface IntroSplashProps {
  onComplete: () => void;
  videoSrc?: string;
}

/**
 * Full-screen intro splash that plays a video WITH SOUND before the
 * main console mounts.
 *
 * Browsers block autoplay-with-sound until the user interacts with the
 * page, so this shows a "tap to begin" gate first. Once tapped, the
 * video plays with audio; it auto-advances to the main app when the
 * video ends, and a skip button is available throughout.
 *
 * Drop this file in: src/components/IntroSplash.tsx
 * Put the video at: public/intro-video.mp4
 */
export function IntroSplash({
  onComplete,
  videoSrc = "/intro-video.mp4",
}: IntroSplashProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);

  const finish = useCallback(() => {
    setFadingOut(true);
    // let the fade-out CSS transition play before unmounting
    window.setTimeout(onComplete, 400);
  }, [onComplete]);

  const handleStart = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    video.volume = 1;
    video.play().catch(() => {
      // if playback with sound is somehow still rejected, fall back
      // to muted playback rather than getting stuck
      video.muted = true;
      video.play().catch(() => finish());
    });
    setStarted(true);
  }, [finish]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: fadingOut ? 0 : 1,
        transition: "opacity 400ms ease",
        pointerEvents: fadingOut ? "none" : "auto",
      }}
    >
      <video
        ref={videoRef}
        src={videoSrc}
        playsInline
        muted={!started}
        onEnded={finish}
        onError={finish}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />

      {!started && (
        <button
          type="button"
          onClick={handleStart}
          style={{
            position: "absolute",
            padding: "16px 40px",
            fontSize: "1rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#fff",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.4)",
            borderRadius: "999px",
            backdropFilter: "blur(4px)",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.18)";
            e.currentTarget.style.transform = "scale(1.04)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.08)";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          ▶ Begin
        </button>
      )}

      {started && (
        <button
          type="button"
          onClick={finish}
          style={{
            position: "absolute",
            top: 20,
            right: 24,
            padding: "8px 18px",
            fontSize: "0.85rem",
            color: "#fff",
            background: "rgba(0,0,0,0.5)",
            border: "1px solid rgba(255,255,255,0.3)",
            borderRadius: "999px",
            backdropFilter: "blur(4px)",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(0,0,0,0.8)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.6)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(0,0,0,0.5)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)";
          }}
        >
          Skip ›
        </button>
      )}
    </div>
  );
}
