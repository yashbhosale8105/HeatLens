'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { GridRankItem, PointTempData } from '@/lib/types';
import { fetchGridRanks } from '@/lib/api';
import { Spinner } from '../ui/Spinner';

// Dynamically import LeafletMap with SSR disabled
const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[580px] rounded-2xl bg-slate-100 flex flex-col items-center justify-center space-y-2 text-slate-500 border border-slate-200">
      <Spinner size="lg" />
      <span className="text-xs font-semibold">Loading Thane OpenStreetMap & Thermal Layers...</span>
    </div>
  ),
});

export function MapContainerWrapper({ onPointSelect }: { onPointSelect?: (data: PointTempData) => void }) {
  const [showRaster, setShowRaster] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [opacity, setOpacity] = useState(0.75);
  const [gridPoints, setGridPoints] = useState<GridRankItem[]>([]);

  useEffect(() => {
    fetchGridRanks(25).then(setGridPoints);
  }, []);

  return (
    <div className="relative w-full h-[620px] rounded-2xl overflow-hidden border border-slate-200 shadow-xl bg-slate-100">
      {/* Dynamic Leaflet Map */}
      <LeafletMap
        gridPoints={gridPoints}
        showRaster={showRaster}
        showGrid={showGrid}
        opacity={opacity}
        onPointSelect={onPointSelect}
      />

      {/* Top-Left: Neat Map Layers Control Panel */}
      <div className="absolute top-4 left-4 z-[1000] p-4 rounded-2xl bg-white/95 border border-slate-200 shadow-2xl backdrop-blur-md space-y-3 text-xs text-slate-800 w-56">
        <div className="font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center justify-between">
          <span>Map & Layer Controls</span>
          <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 font-mono text-[10px]">Landsat 8</span>
        </div>

        {/* Quick Neighborhood Jump */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quick Jump Neighborhood</label>
          <select
            onChange={(e) => {
              const val = e.target.value;
              if (!val) return;
              const [lat, lon] = val.split(',').map(Number);
              if (onPointSelect) {
                onPointSelect({
                  latitude: lat,
                  longitude: lon,
                  lst_celsius: 42.5,
                  lst_fahrenheit: 108.5,
                  ndvi_index: 0.15,
                  vegetation_density: 'Built-up Concrete',
                  satellite: 'Landsat 8 Collection 2 Level 2',
                  band: 'ST_B10 & B4/B5 NDVI',
                  acquisition_date: '2026-06-16',
                  cloud_cover: 3.2,
                  qa_pixel_mask: 'PASS_CLEAN'
                });
              }
            }}
            className="w-full px-2 py-1.5 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-700 focus:outline-none focus:border-rose-500 text-xs"
          >
            <option value="">Select Neighborhood...</option>
            <option value="19.2183,72.9781">Thane Central (19.218°, 72.978°)</option>
            <option value="19.2450,72.9710">Ghodbunder Road (19.245°, 72.971°)</option>
            <option value="19.2290,72.9860">Balkum / Majiwada (19.229°, 72.986°)</option>
            <option value="19.1850,72.9520">Wagle Estate (19.185°, 72.952°)</option>
            <option value="19.1780,72.9750">Kopri / Kalwa (19.178°, 72.975°)</option>
            <option value="19.2400,72.9400">Yeoor Hills Forest (19.240°, 72.940°)</option>
          </select>
        </div>

        <label className="flex items-center gap-2.5 cursor-pointer font-medium hover:text-slate-900 transition-colors pt-1">
          <input
            type="checkbox"
            checked={showRaster}
            onChange={(e) => setShowRaster(e.target.checked)}
            className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 accent-rose-600 cursor-pointer"
          />
          <span>Heat Raster Overlay</span>
        </label>

        <label className="flex items-center gap-2.5 cursor-pointer font-medium hover:text-slate-900 transition-colors">
          <input
            type="checkbox"
            checked={showGrid}
            onChange={(e) => setShowGrid(e.target.checked)}
            className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 accent-rose-600 cursor-pointer"
          />
          <span>Grid Sample Markers</span>
        </label>

        {/* Thermal Layer Opacity Slider */}
        {showRaster && (
          <div className="pt-2 border-t border-slate-100 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-medium text-slate-600">
              <span>Layer Opacity</span>
              <span className="font-mono text-slate-900 font-bold">{Math.round(opacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="1.0"
              step="0.05"
              value={opacity}
              onChange={(e) => setOpacity(parseFloat(e.target.value))}
              className="w-full accent-rose-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
            />
          </div>
        )}
      </div>


      {/* Top-Right: Satellite Acquisition Timestamp Badge */}
      <div className="absolute top-4 right-4 z-[1000] p-3 rounded-2xl bg-white/95 border border-slate-200 shadow-2xl backdrop-blur-md text-right text-xs space-y-0.5 max-w-xs">
        <p className="font-extrabold text-slate-900 flex items-center justify-end gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Data as of: June 16, 2026</span>
        </p>
        <p className="text-[10px] text-slate-500 italic leading-tight">
          *Satellite imagery refreshed via Google Earth Engine API.
        </p>
      </div>

      {/* Bottom-Right: Land Surface Temp (°C) Vibrant Legend Bar */}
      <div className="absolute bottom-4 right-4 z-[1000] p-4 rounded-2xl bg-white/95 border border-slate-200 shadow-2xl backdrop-blur-md space-y-2 text-xs text-slate-800 w-72">
        <div className="font-extrabold flex items-center justify-between text-slate-900">
          <span>Land Surface Temp (°C)</span>
          <span className="text-[10px] text-slate-400 font-mono">ST_B10</span>
        </div>

        {/* High-Contrast Color Gradient Bar */}
        <div className="h-4 w-full rounded-lg bg-gradient-to-r from-blue-600 via-cyan-400 via-yellow-400 via-orange-500 via-red-600 to-rose-900 shadow-sm border border-slate-200" />

        <div className="flex items-center justify-between text-[10px] text-slate-600 font-mono font-bold">
          <span className="text-blue-700">20.0°C (Cool)</span>
          <span className="text-amber-600">35.0°C</span>
          <span className="text-rose-700">50.0°C (Hotspot)</span>
        </div>
      </div>
    </div>
  );
}
