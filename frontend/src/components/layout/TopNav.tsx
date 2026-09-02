'use client';

import React from 'react';
import { useApp } from '@/app/providers';

export function TopNav() {
  const { weather, loading, refreshWeather } = useApp();

  return (
    <header className="h-16 border-b border-slate-200 bg-white/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-xl font-bold text-white shadow-md">
          🌡️
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900">
            HeatLens 📡
          </h1>
          <p className="text-xs text-slate-500">Thane City LST & Heat Risk Intelligence</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {weather && (
          <div className="hidden md:flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
            <span className="flex items-center gap-1.5 text-amber-600 font-bold">
              <span>🌡️</span> {weather.ambient_temp_celsius}°C
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600">
              💧 {weather.relative_humidity}% RH
            </span>
            <span className="text-slate-300">|</span>
            <span className="font-bold text-rose-600">
              HI: {weather.heat_index_celsius}°C ({weather.risk_category})
            </span>
          </div>
        )}

        <button
          onClick={refreshWeather}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 text-white hover:bg-rose-500 transition-all text-xs font-semibold shadow-sm cursor-pointer"
        >
          <span className={loading ? "animate-spin" : ""}>🔄</span>
          <span>{loading ? 'Refreshing...' : 'Sync Satellite Data'}</span>
        </button>
      </div>
    </header>
  );
}
