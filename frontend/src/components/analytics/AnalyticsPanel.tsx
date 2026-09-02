'use client';

import React, { useEffect, useState } from 'react';
import { fetchGridRanks, fetchHistoricalTrends, getExportUrl } from '@/lib/api';
import { GridRankItem } from '@/lib/types';
import { Card } from '../ui/Card';
import { Spinner } from '../ui/Spinner';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

export function AnalyticsPanel() {
  const [gridData, setGridData] = useState<GridRankItem[]>([]);
  const [historical, setHistorical] = useState<{ year: string; summer_max: number; monsoon_avg: number; winter_avg: number }[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchGridRanks(25), fetchHistoricalTrends()]).then(([grid, hist]) => {
      setGridData(grid);
      setHistorical(hist);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="h-48 flex items-center justify-center">
        <Spinner size="md" />
      </div>
    );
  }

  const filteredGrid = gridData.filter(
    (item) =>
      item.neighborhood.toLowerCase().includes(search.toLowerCase()) ||
      item.id.toLowerCase().includes(search.toLowerCase())
  );

  const highestTemp = gridData[0]?.lst_celsius || 44.5;
  const lowestTemp = gridData[gridData.length - 1]?.lst_celsius || 28.2;
  const avgTemp = (gridData.reduce((acc, curr) => acc + curr.lst_celsius, 0) / gridData.length).toFixed(1);

  const scatterData = gridData.map((item) => ({
    x: item.ndvi_index,
    y: item.lst_celsius,
    name: item.neighborhood,
    id: item.id
  }));

  return (
    <div className="space-y-6">
      {/* Micro-grid Summary Cards & Export Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-extrabold text-slate-900">Spatial Thermal Analytics & Export</h3>
          <p className="text-xs text-slate-500">Landsat 8 LST radiometric surface analytics for Thane City</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={getExportUrl('geojson')}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow transition flex items-center gap-1.5"
          >
            <span>📥 Export GeoJSON</span>
          </a>
          <a
            href={getExportUrl('csv')}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow transition flex items-center gap-1.5"
          >
            <span>📄 Export CSV</span>
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-rose-950/20 border-rose-500/30 space-y-1">
          <p className="text-xs text-rose-300 font-semibold">Hottest Micro-Grid Spot</p>
          <p className="text-2xl font-extrabold font-mono text-rose-400">{highestTemp}°C</p>
          <p className="text-[11px] text-slate-400">{gridData[0]?.neighborhood} ({gridData[0]?.id})</p>
        </Card>
        <Card className="bg-amber-950/20 border-amber-500/30 space-y-1">
          <p className="text-xs text-amber-300 font-semibold">City Mean LST</p>
          <p className="text-2xl font-extrabold font-mono text-amber-400">{avgTemp}°C</p>
          <p className="text-[11px] text-slate-400">Across 25 Sampled Micro-Grids</p>
        </Card>
        <Card className="bg-emerald-950/20 border-emerald-500/30 space-y-1">
          <p className="text-xs text-emerald-300 font-semibold">Coolest Buffer Zone</p>
          <p className="text-2xl font-extrabold font-mono text-emerald-400">{lowestTemp}°C</p>
          <p className="text-[11px] text-slate-400">{gridData[gridData.length - 1]?.neighborhood}</p>
        </Card>
      </div>

      {/* Recharts Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Historical LST Trends */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Multi-Year Thermal Trend (2021-2026)
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">°C Surface Peak</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historical}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[20, 50]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem' }}
                  labelStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="summer_max" name="Summer Peak (°C)" stroke="#f43f5e" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="winter_avg" name="Winter Mean (°C)" stroke="#fbbf24" strokeWidth={2} />
                <Line type="monotone" dataKey="monsoon_avg" name="Monsoon Mean (°C)" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: LST vs NDVI Correlation */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              NDVI Vegetation vs. LST Ground Heat Correlation
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">NDVI vs °C</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="x" name="NDVI Index" stroke="#94a3b8" fontSize={11} domain={[-0.1, 1.0]} />
                <YAxis dataKey="y" name="LST (°C)" stroke="#94a3b8" fontSize={11} domain={[25, 50]} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '11px' }}
                />
                <Scatter name="Micro-Grids" data={scatterData} fill="#f43f5e" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Grid Ranks Table */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden backdrop-blur-md">
        <div className="px-5 py-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <h4 className="text-sm font-bold text-slate-200">500m Micro-Grid Surface Rank Table</h4>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search neighborhood or grid ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
            <span className="text-xs text-slate-400 font-mono">Total Grids: {filteredGrid.length}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 font-medium uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3">Rank</th>
                <th className="px-5 py-3">Grid ID</th>
                <th className="px-5 py-3">Neighborhood</th>
                <th className="px-5 py-3">NDVI Index</th>
                <th className="px-5 py-3">Coordinates (Lat, Lon)</th>
                <th className="px-5 py-3 text-right">LST Surface Temp (°C)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredGrid.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-3 font-mono font-bold">
                    <span className={`px-2 py-0.5 rounded text-[11px] ${
                      item.heat_rank <= 3
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : item.heat_rank > 20
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      #{item.heat_rank}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-mono text-slate-400">{item.id}</td>
                  <td className="px-5 py-3 font-medium text-slate-200">{item.neighborhood}</td>
                  <td className="px-5 py-3 font-mono text-emerald-400">{item.ndvi_index}</td>
                  <td className="px-5 py-3 font-mono text-slate-400">{item.latitude}°, {item.longitude}°</td>
                  <td className="px-5 py-3 text-right font-mono font-bold text-amber-300">
                    {item.lst_celsius}°C
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

