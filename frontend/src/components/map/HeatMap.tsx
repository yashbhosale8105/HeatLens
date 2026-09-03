'use client';

import { useEffect, useMemo } from 'react';
import {
  CircleMarker,
  ImageOverlay,
  MapContainer,
  Polygon,
  Popup,
  Rectangle,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { GridRankItem, PointTempData } from '@/lib/types';
import { fetchPointTemp } from '@/lib/api';
import { clampToThane, isInsideThane, THANE_BOUNDS, THANE_CENTER, THANE_MAP_BOUNDS } from '@/lib/places';
import { formatTemp } from '@/lib/utils';

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface HeatMapProps {
  gridPoints: GridRankItem[];
  showRaster: boolean;
  showGrid: boolean;
  opacity: number;
  focus: { lat: number; lon: number } | null;
  selected: PointTempData | null;
  onPointSelect: (data: PointTempData) => void;
}

function ClickHandler({ onPointSelect }: { onPointSelect: (data: PointTempData) => void }) {
  useMapEvents({
    click: async (event) => {
      const { lat, lng } = event.latlng;
      if (!isInsideThane(lat, lng)) return;
      const data = await fetchPointTemp(lat, lng);
      onPointSelect(data);
    },
  });
  return null;
}

function FlyTo({ focus }: { focus: { lat: number; lon: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (!focus) return;
    const next = clampToThane(focus.lat, focus.lon);
    map.flyTo([next.lat, next.lon], 14, { duration: 0.7 });
  }, [focus, map]);
  return null;
}

function LockToThane() {
  const map = useMap();
  useEffect(() => {
    const bounds = L.latLngBounds(THANE_MAP_BOUNDS);
    const lockZoom = () => map.setMinZoom(map.getBoundsZoom(bounds, false));
    lockZoom();
    map.fitBounds(bounds, { animate: false });
    map.on('resize', lockZoom);
    return () => {
      map.off('resize', lockZoom);
    };
  }, [map]);
  return null;
}

// Everything outside the city is washed out so only Thane reads as the subject.
const WORLD_RING: [number, number][] = [
  [-85, -180],
  [-85, 180],
  [85, 180],
  [85, -180],
];

const THANE_RING: [number, number][] = [
  [THANE_BOUNDS.southWest.lat, THANE_BOUNDS.southWest.lon],
  [THANE_BOUNDS.southWest.lat, THANE_BOUNDS.northEast.lon],
  [THANE_BOUNDS.northEast.lat, THANE_BOUNDS.northEast.lon],
  [THANE_BOUNDS.northEast.lat, THANE_BOUNDS.southWest.lon],
];

const RAMP: Array<{ stop: number; rgb: [number, number, number] }> = [
  { stop: 0, rgb: [14, 165, 164] },
  { stop: 0.28, rgb: [101, 163, 13] },
  { stop: 0.52, rgb: [214, 158, 46] },
  { stop: 0.76, rgb: [234, 88, 12] },
  { stop: 1, rgb: [155, 44, 44] },
];

function rampColor(t: number): [number, number, number] {
  const clamped = Math.min(1, Math.max(0, t));
  for (let i = 1; i < RAMP.length; i += 1) {
    const prev = RAMP[i - 1];
    const next = RAMP[i];
    if (clamped <= next.stop) {
      const span = next.stop - prev.stop || 1;
      const k = (clamped - prev.stop) / span;
      return [
        Math.round(prev.rgb[0] + (next.rgb[0] - prev.rgb[0]) * k),
        Math.round(prev.rgb[1] + (next.rgb[1] - prev.rgb[1]) * k),
        Math.round(prev.rgb[2] + (next.rgb[2] - prev.rgb[2]) * k),
      ];
    }
  }
  return RAMP[RAMP.length - 1].rgb;
}

// The samples arrive as a regular lattice, so read them as a surface when we
// can and fall back to inverse-distance weighting when a cell is missing.
function buildSampler(points: GridRankItem[]): (lat: number, lon: number) => number {
  const lats = Array.from(new Set(points.map((point) => point.latitude))).sort((a, b) => a - b);
  const lons = Array.from(new Set(points.map((point) => point.longitude))).sort((a, b) => a - b);
  const cells = new Map(points.map((point) => [`${point.latitude}|${point.longitude}`, point.lst_celsius]));

  const complete =
    lats.length > 1 &&
    lons.length > 1 &&
    lats.length * lons.length === points.length &&
    lats.every((lat) => lons.every((lon) => cells.has(`${lat}|${lon}`)));

  if (!complete) {
    return (lat, lon) => {
      let weightSum = 0;
      let valueSum = 0;
      for (const point of points) {
        const dLat = lat - point.latitude;
        const dLon = lon - point.longitude;
        const distSq = dLat * dLat + dLon * dLon;
        if (distSq < 1e-9) return point.lst_celsius;
        const weight = 1 / (distSq * Math.sqrt(distSq));
        weightSum += weight;
        valueSum += weight * point.lst_celsius;
      }
      return valueSum / weightSum;
    };
  }

  const surface = lats.map((lat) => lons.map((lon) => cells.get(`${lat}|${lon}`) as number));

  const locate = (values: number[], target: number) => {
    const last = values.length - 1;
    if (target <= values[0]) return { index: 0, frac: 0 };
    if (target >= values[last]) return { index: last - 1, frac: 1 };
    let index = 0;
    while (index < last - 1 && target > values[index + 1]) index += 1;
    return { index, frac: (target - values[index]) / (values[index + 1] - values[index]) };
  };
  const ease = (t: number) => t * t * (3 - 2 * t);

  return (lat, lon) => {
    const row = locate(lats, lat);
    const col = locate(lons, lon);
    const ty = ease(row.frac);
    const tx = ease(col.frac);
    const bottom = surface[row.index][col.index] * (1 - tx) + surface[row.index][col.index + 1] * tx;
    const top = surface[row.index + 1][col.index] * (1 - tx) + surface[row.index + 1][col.index + 1] * tx;
    return bottom * (1 - ty) + top * ty;
  };
}

// Paints a continuous surface across the whole city box, edge to edge.
function buildHeatOverlay(points: GridRankItem[]): string | null {
  if (points.length === 0) return null;

  const width = 256;
  const height = 256;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const temps = points.map((point) => point.lst_celsius);
  const min = Math.min(...temps);
  const max = Math.max(...temps);
  const span = max - min || 1;

  const southLat = THANE_BOUNDS.southWest.lat;
  const northLat = THANE_BOUNDS.northEast.lat;
  const westLon = THANE_BOUNDS.southWest.lon;
  const eastLon = THANE_BOUNDS.northEast.lon;

  const image = ctx.createImageData(width, height);
  const sample = buildSampler(points);

  for (let y = 0; y < height; y += 1) {
    const lat = northLat - ((y + 0.5) / height) * (northLat - southLat);
    for (let x = 0; x < width; x += 1) {
      const lon = westLon + ((x + 0.5) / width) * (eastLon - westLon);
      const [r, g, b] = rampColor((sample(lat, lon) - min) / span);
      const index = (y * width + x) * 4;
      image.data[index] = r;
      image.data[index + 1] = g;
      image.data[index + 2] = b;
      image.data[index + 3] = 255;
    }
  }

  ctx.putImageData(image, 0, 0);
  return canvas.toDataURL();
}

export default function HeatMap({
  gridPoints,
  showRaster,
  showGrid,
  opacity,
  focus,
  selected,
  onPointSelect,
}: HeatMapProps) {
  const thanePoints = useMemo(
    () => gridPoints.filter((point) => isInsideThane(point.latitude, point.longitude)),
    [gridPoints]
  );

  const heatmapUrl = useMemo(
    () => (typeof window === 'undefined' ? null : buildHeatOverlay(thanePoints)),
    [thanePoints]
  );

  return (
    <MapContainer
      center={[THANE_CENTER.lat, THANE_CENTER.lon]}
      zoom={13}
      maxZoom={16}
      maxBounds={THANE_MAP_BOUNDS}
      maxBoundsViscosity={1}
      scrollWheelZoom
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {showRaster && heatmapUrl && (
        <ImageOverlay url={heatmapUrl} bounds={THANE_MAP_BOUNDS} opacity={opacity} />
      )}

      <Polygon
        pane="shadowPane"
        positions={[WORLD_RING, THANE_RING]}
        pathOptions={{ stroke: false, fillColor: '#fff1e6', fillOpacity: 0.94 }}
        interactive={false}
      />

      <Rectangle
        pane="shadowPane"
        bounds={THANE_MAP_BOUNDS}
        pathOptions={{ color: '#c2410c', weight: 2, fill: false }}
        interactive={false}
      />

      {showGrid &&
        thanePoints.map((point) => (
          <CircleMarker
            key={point.id}
            center={[point.latitude, point.longitude]}
            radius={5}
            pathOptions={{
              color: '#2b160d',
              fillColor: '#fffdf8',
              fillOpacity: 0.9,
              weight: 1.5,
            }}
            eventHandlers={{
              click: async () => {
                const data = await fetchPointTemp(point.latitude, point.longitude);
                onPointSelect(data);
              },
            }}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-medium">{point.neighborhood}</p>
                <p>
                  Rank {point.heat_rank} · {formatTemp(point.lst_celsius)}
                </p>
              </div>
            </Popup>
          </CircleMarker>
        ))}

      {selected && (
        <CircleMarker
          center={[selected.latitude, selected.longitude]}
          radius={10}
          pathOptions={{ color: '#1c1916', fillColor: '#fffdf8', fillOpacity: 1, weight: 2 }}
        />
      )}

      <LockToThane />
      <ClickHandler onPointSelect={onPointSelect} />
      <FlyTo focus={focus} />
    </MapContainer>
  );
}
