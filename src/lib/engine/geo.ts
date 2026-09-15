import type { GeoCollection, GeoFeature } from "./types";

export function close(ring: [number, number][]): [number, number][] {
  const first = ring[0];
  const last = ring[ring.length - 1];
  if (first[0] === last[0] && first[1] === last[1]) return ring;
  return [...ring, first];
}

export function poly(
  ring: [number, number][],
  properties: GeoFeature["properties"],
): GeoFeature {
  return {
    type: "Feature",
    properties,
    geometry: { type: "Polygon", coordinates: [close(ring)] },
  };
}

export function line(
  coords: [number, number][],
  properties: GeoFeature["properties"],
): GeoFeature {
  return {
    type: "Feature",
    properties,
    geometry: { type: "LineString", coordinates: coords },
  };
}

export function point(
  coord: [number, number],
  properties: GeoFeature["properties"],
): GeoFeature {
  return {
    type: "Feature",
    properties,
    geometry: { type: "Point", coordinates: coord },
  };
}

export function fc(features: GeoFeature[]): GeoCollection {
  return { type: "FeatureCollection", features };
}

export function gsdFromZoom(lat: number, zoom: number) {
  return (156543.03392 * Math.cos((lat * Math.PI) / 180)) / 2 ** zoom;
}
