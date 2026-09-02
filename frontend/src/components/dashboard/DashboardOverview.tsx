'use client';

import React from 'react';
import { useApp } from '@/app/providers';
import { Card } from '../ui/Card';
import { getRiskBadgeClass } from '@/lib/utils';
import { Spinner } from '../ui/Spinner';

export function DashboardOverview() {
  const { weather, loading } = useApp();

  if (loading || !weather) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const metrics = [
    {
      title: 'Ambient Air Temperature',
      value: `${weather.ambient_temp_celsius}°C`,
      subtitle: '2m Surface Level',
      icon: '🌡️',
      color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30'
    },
    {
      title: 'Relative Humidity',
      value: `${weather.relative_humidity}%`,
      subtitle: 'Atmospheric Moisture',
      icon: '💧',
      color: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30'
    },
    {
      title: 'NOAA Heat Index (HI)',
      value: `${weather.heat_index_celsius}°C`,
      subtitle: 'Human Perceived Feel',
      icon: '🔥',
      color: 'from-rose-500/20 to-red-500/10 border-rose-500/30'
    },
    {
      title: 'Solar UV Index',
      value: `${weather.uv_index}`,
      subtitle: 'Peak Radiation Level',
      icon: '☀️',
      color: 'from-purple-500/20 to-pink-500/10 border-purple-500/30'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner Alert */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-rose-950/40 border border-slate-800 backdrop-blur-md shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${getRiskBadgeClass(weather.risk_category)}`}>
              Heat Risk Category: {weather.risk_category}
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-100 mt-2">{weather.location_name} Health Advisory</h3>
          <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">{weather.advisory}</p>
        </div>

        <div className="flex flex-col items-end justify-center px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-800">
          <span className="text-xs text-slate-400">Wind Speed</span>
          <span className="text-xl font-bold font-mono text-slate-200">{weather.wind_speed_kmh} km/h</span>
        </div>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, idx) => (
          <Card key={idx} className={`bg-gradient-to-br ${m.color} border space-y-3`}>
            <div className="flex items-center justify-between text-2xl">
              <span>{m.icon}</span>
              <span className="text-[11px] font-medium text-slate-400">{m.subtitle}</span>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">{m.title}</p>
              <p className="text-2xl font-extrabold font-mono text-slate-100 mt-1">{m.value}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
