'use client';

import React, { useState } from 'react';
import { useApp } from '@/app/providers';
import { MapContainerWrapper } from '../map/MapContainerWrapper';
import { PointTempData } from '@/lib/types';

export function DashboardPanel() {
  const { weather } = useApp();
  const [selectedPoint, setSelectedPoint] = useState<PointTempData | null>(null);

  const topLocations = [
    { rank: 1, name: 'Majiwada Junction', temp: 45.8, category: 'Extreme Hotspot' },
    { rank: 2, name: 'Wagle Industrial Estate', temp: 44.2, category: 'Industrial Hotspot' },
    { rank: 3, name: 'Ghodbunder Corridor', temp: 43.1, category: 'High Urban Heat' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Column: Interactive Leaflet Map (70-75% width) */}
      <div className="lg:col-span-8 space-y-4">
        <MapContainerWrapper onPointSelect={setSelectedPoint} />

        {/* Selected Point Temp Detail Toast / Banner */}
        {selectedPoint && (
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-md flex items-center justify-between text-xs text-slate-700">
            <div className="space-y-0.5">
              <span className="font-bold text-slate-900">
                📍 Lat: {selectedPoint.latitude.toFixed(4)}°, Lon: {selectedPoint.longitude.toFixed(4)}°
              </span>
              <p className="text-slate-500">
                Satellite Sensor: {selectedPoint.satellite} ({selectedPoint.band})
              </p>
            </div>
            <div className="text-right">
              <span className="text-xl font-extrabold font-mono text-rose-600">
                {selectedPoint.lst_celsius}°C
              </span>
              <p className="text-[10px] text-slate-400 font-mono">({selectedPoint.lst_fahrenheit}°F)</p>
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Heat & Climate Summary Sidebar (25-30% width) */}
      <div className="lg:col-span-4 space-y-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-xl text-slate-800">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
          <span className="text-xl">🔥</span>
          <h3 className="text-base font-extrabold text-slate-900">Heat & Climate Summary</h3>
        </div>

        {/* Section 1: LIVE WEATHER & HUMAN HEAT INDEX */}
        <div className="space-y-3">
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Live Weather & Human Heat Index
          </h4>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-3xl font-extrabold font-mono text-slate-900">
                {weather ? `${weather.heat_index_celsius}°C` : '25.9°C'}
              </p>
              <p className="text-[11px] text-slate-500 font-medium">NOAA Heat Index</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-300">
              {weather ? weather.risk_category : 'Normal'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
              <p className="text-[10px] text-slate-400 font-medium">Air Temperature</p>
              <p className="text-sm font-bold text-slate-900 font-mono">
                {weather ? `${weather.ambient_temp_celsius}°C` : '24.9°C'}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
              <p className="text-[10px] text-slate-400 font-medium">Relative Humidity</p>
              <p className="text-sm font-bold text-slate-900 font-mono">
                {weather ? `${weather.relative_humidity}%` : '93%'}
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: SATELLITE LAND SURFACE TEMP (LST) */}
        <div className="space-y-2.5 pt-2 border-t border-slate-100">
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Satellite Land Surface Temp (LST)
          </h4>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">District Mean LST</span>
            <span className="text-2xl font-extrabold font-mono text-slate-900">44.38°C</span>
          </div>

          <p className="text-[10px] text-slate-400 italic leading-relaxed">
            Acquired: Jun 16, 2026<br />
            *Radiometric skin temperature of ground, distinct from air heat index.
          </p>
        </div>

        {/* Section 3: TOP 3 HOTTEST LOCATIONS */}
        <div className="space-y-2.5 pt-2 border-t border-slate-100">
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Top 3 Hottest Locations
          </h4>

          <div className="space-y-2">
            {topLocations.map((loc) => (
              <div
                key={loc.rank}
                className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center text-[10px]">
                    #{loc.rank}
                  </span>
                  <div>
                    <p className="font-bold text-slate-900">{loc.name}</p>
                    <p className="text-[10px] text-rose-600 font-medium">{loc.category}</p>
                  </div>
                </div>
                <span className="font-extrabold font-mono text-rose-600">{loc.temp}°C</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
