import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { useConsole } from "@/lib/store";

/**
 * Thermal Infrared Overlay Component
 * Simulates thermal/heat visualization based on mission data and location
 */
export function ThermalOverlay() {
  const map = useMap();
  const result = useConsole((s) => s.result);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const layerRef = useRef<L.ImageOverlay | null>(null);

  useEffect(() => {
    if (!result) return;

    // Create canvas for thermal rendering
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    canvasRef.current = canvas;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Generate thermal gradient based on location and mission type
    const generateThermalData = () => {
      const imageData = ctx.createImageData(512, 512);
      const data = imageData.data;

      // Get mission bounds
      const bounds = map.getBounds();
      const center = result.center;

      // Generate thermal hotspots based on mission type
      const hotspots: Array<{ x: number; y: number; intensity: number; radius: number }> = [];

      // Fire/thermal missions get high-intensity hotspots
      if (
        result.missionId === "delhi_thermal" ||
        result.query.toLowerCase().includes("fire") ||
        result.query.toLowerCase().includes("heat")
      ) {
        // Multiple fire hotspots
        for (let i = 0; i < 8; i++) {
          hotspots.push({
            x: 128 + Math.random() * 256,
            y: 128 + Math.random() * 256,
            intensity: 0.7 + Math.random() * 0.3, // High heat
            radius: 40 + Math.random() * 40,
          });
        }
      } else {
        // General thermal variation (normal temperature gradients)
        for (let i = 0; i < 15; i++) {
          hotspots.push({
            x: Math.random() * 512,
            y: Math.random() * 512,
            intensity: 0.2 + Math.random() * 0.4, // Medium heat
            radius: 60 + Math.random() * 60,
          });
        }
      }

      // Add urban heat islands (if cities detected)
      if (
        result.query.toLowerCase().includes("city") ||
        result.query.toLowerCase().includes("urban") ||
        result.missionId === "delhi_thermal"
      ) {
        // Urban areas are warmer
        hotspots.push({
          x: 256,
          y: 256,
          intensity: 0.6,
          radius: 120,
        });
      }

      // Render thermal data
      for (let y = 0; y < 512; y++) {
        for (let x = 0; x < 512; x++) {
          const idx = (y * 512 + x) * 4;

          // Calculate temperature based on distance to hotspots
          let temperature = 0.1; // Base ambient temperature

          for (const hotspot of hotspots) {
            const dx = x - hotspot.x;
            const dy = y - hotspot.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const influence = Math.max(
              0,
              hotspot.intensity * (1 - distance / hotspot.radius)
            );
            temperature += influence;
          }

          // Clamp temperature
          temperature = Math.min(1, Math.max(0, temperature));

          // Convert temperature to color (thermal colormap)
          const color = temperatureToColor(temperature);

          data[idx] = color.r;
          data[idx + 1] = color.g;
          data[idx + 2] = color.b;
          data[idx + 3] = Math.round(temperature * 180); // Opacity based on intensity
        }
      }

      ctx.putImageData(imageData, 0, 0);
    };

    generateThermalData();

    // Create image overlay from canvas
    const dataUrl = canvas.toDataURL();
    const bounds = map.getBounds();

    // Remove previous layer if exists
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
    }

    // Add thermal overlay
    const overlay = L.imageOverlay(dataUrl, bounds, {
      opacity: 0.6,
      interactive: false,
    });
    overlay.addTo(map);
    layerRef.current = overlay;

    // Update overlay on map move/zoom
    const updateOverlay = () => {
      if (layerRef.current) {
        const newBounds = map.getBounds();
        layerRef.current.setBounds(newBounds);
      }
    };

    map.on("moveend", updateOverlay);
    map.on("zoomend", updateOverlay);

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
      }
      map.off("moveend", updateOverlay);
      map.off("zoomend", updateOverlay);
    };
  }, [map, result]);

  return null; // This component renders directly to the map
}

/**
 * Convert temperature (0-1) to thermal color
 * Using standard thermal/infrared colormap: black → purple → red → orange → yellow → white
 */
function temperatureToColor(temp: number): { r: number; g: number; b: number } {
  // Thermal colormap
  if (temp < 0.2) {
    // Black to purple (cold)
    const t = temp / 0.2;
    return {
      r: Math.round(t * 100),
      g: 0,
      b: Math.round(t * 150),
    };
  } else if (temp < 0.4) {
    // Purple to red (cool)
    const t = (temp - 0.2) / 0.2;
    return {
      r: Math.round(100 + t * 155),
      g: 0,
      b: Math.round(150 - t * 150),
    };
  } else if (temp < 0.6) {
    // Red to orange (warm)
    const t = (temp - 0.4) / 0.2;
    return {
      r: 255,
      g: Math.round(t * 140),
      b: 0,
    };
  } else if (temp < 0.8) {
    // Orange to yellow (hot)
    const t = (temp - 0.6) / 0.2;
    return {
      r: 255,
      g: Math.round(140 + t * 115),
      b: 0,
    };
  } else {
    // Yellow to white (very hot)
    const t = (temp - 0.8) / 0.2;
    return {
      r: 255,
      g: 255,
      b: Math.round(t * 255),
    };
  }
}
