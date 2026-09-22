import { useEffect, useRef } from "react";
import L from "leaflet";
import { CircleMarker, GeoJSON, MapContainer, Pane, TileLayer, Tooltip, useMap } from "react-leaflet";
import type { Feature, GeoJsonObject } from "geojson";
import type { PathOptions } from "leaflet";
import { MISSIONS } from "@/lib/engine/missions";
import { useConsole } from "@/lib/store";
import type { GeoFeature } from "@/lib/engine/types";
import "leaflet/dist/leaflet.css";

const ESRI =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
const HILL =
  "https://server.arcgisonline.com/ArcGIS/rest/services/Elevation/World_Hillshade/MapServer/tile/{z}/{y}/{x}";
const ATTR = "Tiles © Esri";
const INDIA: [number, number] = [22.97, 78.66];

function styleFeature(feature?: Feature): PathOptions {
  const kind = (feature?.properties as GeoFeature["properties"] | undefined)?.kind;
  switch (kind) {
    case "flood":
      return { color: "#5b9aa0", weight: 1.5, fillColor: "#5b9aa0", fillOpacity: 0.38 };
    case "canopy_flood":
      return {
        color: "#7a9e8a",
        weight: 1.5,
        dashArray: "5 4",
        fillColor: "#7a9e8a",
        fillOpacity: 0.42,
      };
    case "subsidence":
      return { color: "#c45c4a", weight: 1.5, fillColor: "#c45c4a", fillOpacity: 0.4 };
    case "harvest":
      return { color: "#8a8880", weight: 1, fillColor: "#a3a090", fillOpacity: 0.28 };
    case "deforest":
      return { color: "#c45c4a", weight: 1.5, fillColor: "#6b8f71", fillOpacity: 0.45 };
    case "road":
      return { color: "#e8e6e1", weight: 3, opacity: 0.92 };
    case "mangrove_loss":
      return { color: "#4a7c59", weight: 1.5, fillColor: "#2d5a3f", fillOpacity: 0.45 };
    case "lake":
      return { color: "#3b82f6", weight: 1.5, fillColor: "#2563eb", fillOpacity: 0.4 };
    case "hazard":
      return { color: "#ef4444", weight: 2, fillColor: "#dc2626", fillOpacity: 0.5 };
    case "flood_path":
      return { color: "#06b6d4", weight: 3, opacity: 0.85, dashArray: "6 4" };
    case "plume":
      return { color: "#a855f7", weight: 1, fillColor: "#9333ea", fillOpacity: 0.3 };
    case "hotspot":
      return { color: "#f97316", weight: 2, fillColor: "#ea580c", fillOpacity: 0.55 };
    case "trajectory":
      return { color: "#fb923c", weight: 2.5, dashArray: "4 4", opacity: 0.9 };
    case "mineral":
    case "core_target":
      return { color: "#eab308", weight: 1.5, fillColor: "#ca8a04", fillOpacity: 0.42 };
    case "fault":
      return { color: "#d97706", weight: 2, dashArray: "5 3", opacity: 0.88 };
    default:
      return { color: "#7a9e8a", weight: 1, fillColor: "#7a9e8a", fillOpacity: 0.18 };
  }
}

function isFiniteLatLng(lat: number, lng: number) {
  return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
}

function FlyTo() {
  const map = useMap();
  const nonce = useConsole((s) => s.flyNonce);
  const last = useRef(0);
  useEffect(() => {
    if (nonce === last.current) return;
    last.current = nonce;
    const { center, zoom } = useConsole.getState();
    if (!isFiniteLatLng(center[0], center[1]) || !Number.isFinite(zoom)) return;
    const size = map.getSize();
    if (!size || size.x < 20 || size.y < 20) {
      map.invalidateSize();
      map.setView(center, zoom);
      return;
    }
    try {
      map.flyTo(center, zoom, { duration: 1.05 });
    } catch {
      map.setView(center, zoom);
    }
  }, [nonce, map]);
  return null;
}

function ViewSync() {
  const map = useMap();
  const setView = useConsole((s) => s.setView);
  useEffect(() => {
    const on = () => {
      const c = map.getCenter();
      const z = map.getZoom();
      if (!isFiniteLatLng(c.lat, c.lng) || !Number.isFinite(z)) return;
      setView([c.lat, c.lng], z);
    };
    map.on("moveend", on);
    return () => {
      map.off("moveend", on);
    };
  }, [map, setView]);
  return null;
}

function SizeFix() {
  const map = useMap();
  useEffect(() => {
    const kick = () => {
      const el = map.getContainer();
      if (el.clientWidth < 8 || el.clientHeight < 8) return;
      map.invalidateSize();
    };
    const t = window.setTimeout(kick, 120);
    const t2 = window.setTimeout(kick, 400);
    window.addEventListener("resize", kick);
    return () => {
      window.clearTimeout(t);
      window.clearTimeout(t2);
      window.removeEventListener("resize", kick);
    };
  }, [map]);
  return null;
}

function SwipeClip() {
  const map = useMap();
  const swipe = useConsole((s) => s.swipe);
  const enabled = useConsole((s) => s.result?.swipeEnabled);
  useEffect(() => {
    const pane = map.getPane("compare");
    if (!pane) return;
    if (!enabled) {
      pane.style.clipPath = "none";
      return;
    }
    const apply = () => {
      const w = map.getSize().x;
      if (!Number.isFinite(w) || w < 8) return;
      const x = (swipe / 100) * w;
      pane.style.clipPath = `inset(0 0 0 ${x}px)`;
    };
    apply();
    map.on("resize", apply);
    map.on("move", apply);
    map.on("zoom", apply);
    return () => {
      map.off("resize", apply);
      map.off("move", apply);
      map.off("zoom", apply);
    };
  }, [map, swipe, enabled]);
  return null;
}

function estimateElevation(lat: number, lng: number): number {
  if (lat > 29.5 && lat < 31.5 && lng > 78.5 && lng < 81.0) {
    return Math.round(1850 + (lat - 30.5) * 800 + Math.sin(lng * 10) * 120);
  }
  if (lat > 9.2 && lat < 9.7 && lng > 76.3 && lng < 76.65) {
    return Number((-0.8 - Math.abs(lat - 9.49) * 0.9).toFixed(1));
  }
  if (lat > 26.3 && lat < 26.8 && lng > 92.8 && lng < 93.5) {
    return Math.round(62 + Math.cos(lat * 5) * 8);
  }
  if (lat > 25.5 && lat < 26.5 && lng > 76.8 && lng < 77.8) {
    return Math.round(175 + Math.sin(lng * 4) * 25);
  }
  return Math.max(10, Math.round(Math.abs(lat - 12) * 22 + Math.cos(lng * 0.1) * 60));
}

function CursorTracker() {
  const map = useMap();
  const setCursorCoords = useConsole((s) => s.setCursorCoords);

  useEffect(() => {
    const onMove = (e: L.LeafletMouseEvent) => {
      const lat = Number(e.latlng.lat.toFixed(5));
      const lng = Number(e.latlng.lng.toFixed(5));
      const elev = estimateElevation(lat, lng);
      setCursorCoords({ lat, lng, elev });
    };
    const onOut = () => {
      setCursorCoords(null);
    };
    map.on("mousemove", onMove);
    map.on("mouseout", onOut);
    return () => {
      map.off("mousemove", onMove);
      map.off("mouseout", onOut);
    };
  }, [map, setCursorCoords]);

  return null;
}

export function MapInner() {
  const result = useConsole((s) => s.result);
  const mapMode = useConsole((s) => s.mapMode);
  const sarDisplayMode = useConsole((s) => s.sarDisplayMode);
  const loadMission = useConsole((s) => s.loadMission);
  const sar = mapMode === "sar";
  const dem = mapMode === "dem";

  return (
    <MapContainer
      center={INDIA}
      zoom={5}
      minZoom={4}
      maxZoom={17}
      className="h-full w-full"
      maxBounds={[
        [4, 64],
        [40, 102],
      ]}
      worldCopyJump={false}
    >
      <TileLayer
        url={dem ? HILL : ESRI}
        attribution={ATTR}
        className={
          sar
            ? sarDisplayMode === "pauli_rgb"
              ? "sar-pauli-tiles"
              : "sar-tiles"
            : dem
              ? "dem-tiles"
              : ""
        }
      />
      <Pane name="compare" style={{ zIndex: 350 }}>
        <TileLayer url={HILL} attribution={ATTR} />
      </Pane>
      <FlyTo />
      <ViewSync />
      <SizeFix />
      <SwipeClip />
      <CursorTracker />

      {result && (
        <GeoJSON
          key={result.missionId ?? result.query}
          data={result.geojson as unknown as GeoJsonObject}
          style={styleFeature}
          pointToLayer={(_f, latlng) =>
            L.circleMarker(latlng, {
              radius: 6,
              color: "#e8e6e1",
              weight: 1,
              fillColor: "#7a9e8a",
              fillOpacity: 0.9,
            })
          }
          onEachFeature={(feature, layer) => {
            const props = feature.properties as GeoFeature["properties"] | null;
            const name = props?.name;
            const value = props?.value;
            const unit = props?.unit;
            if (name) {
              layer.bindTooltip(
                `${name}${value != null ? ` · ${value} ${unit ?? ""}` : ""}`,
                { sticky: true },
              );
            }
          }}
        />
      )}

      {!result &&
        MISSIONS.map((m) => (
          <CircleMarker
            key={m.id}
            center={m.center}
            radius={8}
            pathOptions={{
              color: "#e8e6e1",
              weight: 1.5,
              fillColor: "#7a9e8a",
              fillOpacity: 0.85,
            }}
            eventHandlers={{ click: () => void loadMission(m.id) }}
          >
            <Tooltip direction="top" offset={[0, -8]}>
              <span className="font-sans text-xs">
                {m.code} · {m.title}
              </span>
            </Tooltip>
          </CircleMarker>
        ))}
    </MapContainer>
  );
}
