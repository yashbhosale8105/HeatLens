'use client';

import { useEffect, useState } from 'react';
import { CircleMarker, ImageOverlay, MapContainer, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { GridRankItem, PointTempData } from '@/lib/types';
import { fetchPointTemp } from '@/lib/api';
import { THANE_CENTER } from '@/lib/places';
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
      const data = await fetchPointTemp(event.latlng.lat, event.latlng.lng);
      onPointSelect(data);
    },
  });
  return null;
}

function FlyTo({ focus }: { focus: { lat: number; lon: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (!focus) return;
    map.flyTo([focus.lat, focus.lon], 14, { duration: 0.7 });
  }, [focus, map]);
  return null;
}

function buildHeatOverlay(): string | null {
  const width = 800;
  const height = 800;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const drawSpot = (x: number, y: number, radius: number, temp: number) => {
    const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
    if (temp >= 44) {
      grad.addColorStop(0, 'rgba(155, 44, 44, 0.88)');
      grad.addColorStop(0.45, 'rgba(192, 86, 33, 0.55)');
      grad.addColorStop(1, 'rgba(214, 158, 46, 0)');
    } else if (temp >= 38) {
      grad.addColorStop(0, 'rgba(192, 86, 33, 0.75)');
      grad.addColorStop(0.55, 'rgba(214, 158, 46, 0.4)');
      grad.addColorStop(1, 'rgba(56, 161, 105, 0)');
    } else if (temp >= 32) {
      grad.addColorStop(0, 'rgba(214, 158, 46, 0.55)');
      grad.addColorStop(1, 'rgba(56, 161, 105, 0)');
    } else {
      grad.addColorStop(0, 'rgba(43, 108, 176, 0.55)');
      grad.addColorStop(1, 'rgba(43, 108, 176, 0)');
    }
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  };

  [
    { x: 380, y: 390, r: 170, temp: 46 },
    { x: 310, y: 520, r: 150, temp: 44 },
    { x: 440, y: 260, r: 160, temp: 43 },
    { x: 480, y: 450, r: 130, temp: 41 },
    { x: 180, y: 320, r: 180, temp: 27 },
    { x: 150, y: 680, r: 130, temp: 28 },
  ].forEach((zone) => drawSpot(zone.x, zone.y, zone.r, zone.temp));

  const mask = ctx.createRadialGradient(width / 2, height / 2, width * 0.28, width / 2, height / 2, width * 0.48);
  mask.addColorStop(0, 'rgba(0,0,0,1)');
  mask.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.globalCompositeOperation = 'destination-in';
  ctx.fillStyle = mask;
  ctx.fillRect(0, 0, width, height);

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
  const [heatmapUrl, setHeatmapUrl] = useState<string | null>(null);

  useEffect(() => {
    setHeatmapUrl(buildHeatOverlay());
  }, []);

  const bounds: [[number, number], [number, number]] = [
    [19.13, 72.9],
    [19.31, 73.06],
  ];

  return (
    <MapContainer
      center={[THANE_CENTER.lat, THANE_CENTER.lon]}
      zoom={12}
      scrollWheelZoom
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {showRaster && heatmapUrl && <ImageOverlay url={heatmapUrl} bounds={bounds} opacity={opacity} />}

      {showGrid &&
        gridPoints.map((point) => (
          <CircleMarker
            key={point.id}
            center={[point.latitude, point.longitude]}
            radius={6}
            pathOptions={{
              color: point.lst_celsius > 42 ? '#9b2c2c' : point.lst_celsius > 36 ? '#c05621' : '#2b6cb0',
              fillColor: point.lst_celsius > 42 ? '#c53030' : point.lst_celsius > 36 ? '#dd6b20' : '#3182ce',
              fillOpacity: 0.85,
              weight: 1,
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

      <ClickHandler onPointSelect={onPointSelect} />
      <FlyTo focus={focus} />
    </MapContainer>
  );
}
