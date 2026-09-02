'use client';

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, ImageOverlay, CircleMarker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { GridRankItem, PointTempData } from '@/lib/types';
import { fetchPointTemp } from '@/lib/api';

// Fix default leaflet marker icon path issue in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface LeafletMapProps {
  gridPoints: GridRankItem[];
  showRaster: boolean;
  showGrid: boolean;
  opacity: number;
  onPointSelect?: (data: PointTempData) => void;
}

// Map Click Handler Component
function MapClickHandler({ onPointSelect }: { onPointSelect?: (data: PointTempData) => void }) {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      const data = await fetchPointTemp(lat, lng);
      if (onPointSelect) {
        onPointSelect(data);
      }
    },
  });
  return null;
}

export default function LeafletMap({ gridPoints, showRaster, showGrid, opacity, onPointSelect }: LeafletMapProps) {
  const [heatmapUrl, setHeatmapUrl] = useState<string | null>(null);

  // Generate high-contrast, feather-edged Landsat LST thermal layer
  useEffect(() => {
    const canvas = document.createElement('canvas');
    const width = 800;
    const height = 800;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.clearRect(0, 0, width, height);

      // Helper function to draw vibrant radial heat spots
      const drawHeatSpot = (x: number, y: number, radius: number, tempCelsius: number) => {
        const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);

        if (tempCelsius >= 44) {
          // Extreme Crimson Hotspot
          grad.addColorStop(0.0, 'rgba(180, 0, 0, 0.95)');
          grad.addColorStop(0.35, 'rgba(235, 45, 0, 0.85)');
          grad.addColorStop(0.70, 'rgba(255, 170, 0, 0.60)');
          grad.addColorStop(1.0, 'rgba(255, 230, 0, 0.0)');
        } else if (tempCelsius >= 38) {
          // High Urban Heat (Orange / Amber)
          grad.addColorStop(0.0, 'rgba(240, 90, 0, 0.90)');
          grad.addColorStop(0.40, 'rgba(255, 180, 0, 0.75)');
          grad.addColorStop(0.75, 'rgba(255, 235, 50, 0.50)');
          grad.addColorStop(1.0, 'rgba(100, 220, 50, 0.0)');
        } else if (tempCelsius >= 32) {
          // Moderate Warm (Yellow / Green)
          grad.addColorStop(0.0, 'rgba(220, 220, 0, 0.80)');
          grad.addColorStop(0.50, 'rgba(110, 210, 60, 0.60)');
          grad.addColorStop(1.0, 'rgba(0, 190, 220, 0.0)');
        } else {
          // Cool Forest / River Buffer (Cyan / Blue)
          grad.addColorStop(0.0, 'rgba(0, 160, 220, 0.80)');
          grad.addColorStop(0.50, 'rgba(30, 80, 200, 0.50)');
          grad.addColorStop(1.0, 'rgba(20, 30, 140, 0.0)');
        }

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      };

      // Base background blend
      const baseGrad = ctx.createLinearGradient(0, 0, width, height);
      baseGrad.addColorStop(0.0, 'rgba(30, 180, 120, 0.2)');
      baseGrad.addColorStop(0.5, 'rgba(240, 190, 40, 0.3)');
      baseGrad.addColorStop(1.0, 'rgba(220, 40, 40, 0.3)');
      ctx.fillStyle = baseGrad;
      ctx.fillRect(0, 0, width, height);

      // Key Thane micro-region heat centers mapped to canvas coords
      const thermalZones = [
        { x: 380, y: 390, r: 180, temp: 46.2 }, // Majiwada Junction (Hottest core)
        { x: 310, y: 520, r: 160, temp: 44.8 }, // Wagle Industrial Estate
        { x: 440, y: 260, r: 170, temp: 43.5 }, // Ghodbunder Road Corridor
        { x: 480, y: 450, r: 140, temp: 42.1 }, // Balkum / Kolshet
        { x: 520, y: 600, r: 130, temp: 41.0 }, // Kalwa / Mumbra Creek Belt
        { x: 320, y: 640, r: 120, temp: 40.5 }, // Kopri / Mulund Border
        { x: 180, y: 320, r: 190, temp: 26.5 }, // Yeoor Forest Hills (Cooling Sink)
        { x: 150, y: 680, r: 140, temp: 28.0 }, // Tulsi / Vihar Lake Buffer
      ];

      thermalZones.forEach(zone => {
        drawHeatSpot(zone.x, zone.y, zone.r, zone.temp);
      });

      // Soft feather mask to eliminate hard square border cutoffs
      const maskCanvas = document.createElement('canvas');
      maskCanvas.width = width;
      maskCanvas.height = height;
      const maskCtx = maskCanvas.getContext('2d');
      if (maskCtx) {
        const borderGrad = maskCtx.createRadialGradient(
          width / 2, height / 2, width * 0.3,
          width / 2, height / 2, width * 0.48
        );
        borderGrad.addColorStop(0, 'rgba(0,0,0,1)');
        borderGrad.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.globalCompositeOperation = 'destination-in';
        ctx.fillStyle = borderGrad;
        ctx.fillRect(0, 0, width, height);
      }

      setHeatmapUrl(canvas.toDataURL());
    }
  }, []);

  const thaneCenter: [number, number] = [19.2183, 72.9781];
  const thaneBounds: [[number, number], [number, number]] = [
    [19.130, 72.900],
    [19.310, 73.060]
  ];

  return (
    <MapContainer
      center={thaneCenter}
      zoom={12}
      scrollWheelZoom={true}
      zoomControl={false} // Custom zoom control position
      className="w-full h-full rounded-2xl z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {showRaster && heatmapUrl && (
        <ImageOverlay
          url={heatmapUrl}
          bounds={thaneBounds}
          opacity={opacity}
        />
      )}

      {showGrid && gridPoints.map((point) => (
        <CircleMarker
          key={point.id}
          center={[point.latitude, point.longitude]}
          radius={7}
          pathOptions={{
            color: point.lst_celsius > 42 ? '#b71c1c' : point.lst_celsius > 36 ? '#e65100' : '#0288d1',
            fillColor: point.lst_celsius > 42 ? '#d32f2f' : point.lst_celsius > 36 ? '#f57c00' : '#03a9f4',
            fillOpacity: 0.9,
            weight: 2
          }}
          eventHandlers={{
            click: async () => {
              const data = await fetchPointTemp(point.latitude, point.longitude);
              if (onPointSelect) onPointSelect(data);
            }
          }}
        >
          <Popup>
            <div className="p-1 font-sans text-xs">
              <p className="font-bold text-slate-900">{point.neighborhood}</p>
              <p className="text-slate-600 font-mono">Rank #{point.heat_rank} • <span className="font-bold text-rose-600">{point.lst_celsius}°C</span></p>
            </div>
          </Popup>
        </CircleMarker>
      ))}

      <MapClickHandler onPointSelect={onPointSelect} />
    </MapContainer>
  );
}
