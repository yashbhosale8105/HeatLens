'use client';

import React from 'react';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { Card } from '@/components/ui/Card';

export default function AboutPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <SectionTitle
        title="About HeatLens 🌡️📡"
        subtitle="Satellite-Powered Land Surface Temperature & Heat Risk Analytics Platform"
        icon="ℹ️"
      />

      <Card className="space-y-4">
        <h3 className="text-lg font-bold text-slate-100">Overview</h3>
        <p className="text-sm text-slate-300 leading-relaxed">
          <strong>HeatLens</strong> is a real-time satellite monitoring and micro-grid urban heat analytics engine specifically tailored for Thane City, Maharashtra, India. It combines satellite radiometry from Google Earth Engine (Landsat 8 Collection 2 Level 2) with real-time atmospheric measurements from Open-Meteo API.
        </p>

        <div className="border-t border-slate-800 pt-4 space-y-3">
          <h4 className="text-sm font-bold text-amber-400">Radiometric Formula & Scaling</h4>
          <code className="block p-3 rounded-lg bg-slate-950 font-mono text-xs text-rose-300 border border-slate-800">
            LST (°C) = (0.00341802 * ST_B10 + 149.0) - 273.15
          </code>
          <p className="text-xs text-slate-400 leading-relaxed">
            The platform applies QA_PIXEL and QA_RADSAT bitmasking to eliminate cloud cover, cirrus noise, water bodies, and band saturation before computing surface temperatures.
          </p>
        </div>

        <div className="border-t border-slate-800 pt-4 space-y-3">
          <h4 className="text-sm font-bold text-rose-400">NOAA Heat Index ($HI$) & Risk Classification</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Combines ambient temperature ($T$) and relative humidity ($RH$) to assess human-perceived heat stress across 5 risk categories:
            <span className="text-emerald-400 font-semibold ml-1">Normal</span>,
            <span className="text-amber-300 font-semibold ml-1">Caution</span>,
            <span className="text-orange-400 font-semibold ml-1">Extreme Caution</span>,
            <span className="text-red-400 font-semibold ml-1">Danger</span>, and
            <span className="text-rose-500 font-semibold ml-1">Extreme Danger</span>.
          </p>
        </div>
      </Card>
    </div>
  );
}
