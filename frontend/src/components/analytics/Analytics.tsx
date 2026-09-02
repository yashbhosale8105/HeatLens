'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from 'recharts';
import { fetchHistoricalTrends, getExportUrl } from '@/lib/api';
import { HistoricalTrend } from '@/lib/types';
import { useApp } from '@/app/providers';
import { formatTemp, heatBand, mean } from '@/lib/utils';
import { Spinner } from '../ui/Spinner';

type SortKey = 'heat_rank' | 'neighborhood' | 'lst_celsius' | 'ndvi_index';
type BandFilter = 'all' | 'hot' | 'warm' | 'cool';

export function Analytics() {
  const { grid, loading, error } = useApp();
  const [historical, setHistorical] = useState<HistoricalTrend[]>([]);
  const [search, setSearch] = useState('');
  const [band, setBand] = useState<BandFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('heat_rank');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetchHistoricalTrends().then(setHistorical).catch(() => setHistorical([]));
  }, []);

  const temps = grid.map((item) => item.lst_celsius);
  const hottest = grid[0];
  const coolest = grid[grid.length - 1];

  const rows = useMemo(() => {
    const filtered = grid.filter((item) => {
      const q = search.trim().toLowerCase();
      const matchesSearch = !q || item.neighborhood.toLowerCase().includes(q) || item.id.toLowerCase().includes(q);
      const matchesBand = band === 'all' || heatBand(item.lst_celsius) === band;
      return matchesSearch && matchesBand;
    });

    return [...filtered].sort((a, b) => {
      const left = a[sortKey];
      const right = b[sortKey];
      const cmp = typeof left === 'string' ? left.localeCompare(String(right)) : Number(left) - Number(right);
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [grid, search, band, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortKey(key);
    setSortDir(key === 'neighborhood' ? 'asc' : 'desc');
  }

  const scatterData = grid.map((item) => ({
    x: item.ndvi_index,
    y: item.lst_celsius,
    name: item.neighborhood,
  }));

  return (
    <div className="space-y-6">
      {error && (
        <div className="panel px-4 py-3 text-sm text-[var(--heat)]" role="alert">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[var(--muted)]">{grid.length} sample points. Download the current grid if you need it offline.</p>
        <div className="flex flex-wrap gap-2">
          <a className="btn-ghost btn" href={getExportUrl('csv')} target="_blank" rel="noreferrer">
            Download CSV
          </a>
          <a className="btn" href={getExportUrl('geojson')} target="_blank" rel="noreferrer">
            Download GeoJSON
          </a>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Summary label="Hottest point" value={hottest ? formatTemp(hottest.lst_celsius) : '—'} note={hottest?.neighborhood} />
        <Summary label="City mean" value={temps.length ? formatTemp(mean(temps)) : '—'} note="All sample points" />
        <Summary label="Coolest point" value={coolest ? formatTemp(coolest.lst_celsius) : '—'} note={coolest?.neighborhood} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="panel p-5">
          <h2 className="text-[1.45rem]">Seasonal trend</h2>
          <p className="mb-3 text-[0.98rem] text-[var(--muted)]">Summer peak, monsoon mean, winter mean</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historical}>
                <CartesianGrid stroke="#efd2bc" strokeDasharray="3 3" />
                <XAxis dataKey="year" stroke="#6e4b3a" fontSize={12} />
                <YAxis stroke="#6e4b3a" fontSize={12} domain={[20, 50]} />
                <Tooltip contentStyle={{ border: '1px solid #efd2bc', background: '#fffaf5', borderRadius: 10, fontSize: 13 }} />
                <Line type="monotone" dataKey="summer_max" name="Summer peak" stroke="#c2410c" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="monsoon_avg" name="Monsoon" stroke="#0b6e6a" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="winter_avg" name="Winter" stroke="#c05621" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel p-5">
          <h2 className="text-[1.45rem]">Greenery vs ground heat</h2>
          <p className="mb-3 text-[0.98rem] text-[var(--muted)]">Higher NDVI usually means a cooler surface</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid stroke="#efd2bc" strokeDasharray="3 3" />
                <XAxis dataKey="x" name="NDVI" stroke="#6e4b3a" fontSize={12} />
                <YAxis dataKey="y" name="LST" stroke="#6e4b3a" fontSize={12} domain={[25, 50]} />
                <Tooltip contentStyle={{ border: '1px solid #efd2bc', background: '#fffaf5', borderRadius: 10, fontSize: 13 }} />
                <Scatter data={scatterData} fill="#ea580c" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="panel overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-[var(--line)] px-5 py-4 md:flex-row md:items-end md:justify-between">
          <h2 className="text-[1.45rem]">Ranked sample table</h2>
          <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
            <label className="text-sm text-[var(--muted)]">
              Search
              <input
                className="field mt-1 min-w-52"
                placeholder="Place or grid id"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
            <label className="text-sm text-[var(--muted)]">
              Temperature band
              <select className="field mt-1" value={band} onChange={(e) => setBand(e.target.value as BandFilter)}>
                <option value="all">All temperatures</option>
                <option value="hot">Hot (42°C+)</option>
                <option value="warm">Warm (36–42°C)</option>
                <option value="cool">Cooler (under 36°C)</option>
              </select>
            </label>
          </div>
        </div>

        {loading && !grid.length ? (
          <Spinner label="Loading table" />
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table w-full text-left text-sm">
              <caption className="sr-only">Sortable sample points with surface temperature and NDVI</caption>
              <thead className="border-b border-[var(--line)] text-xs uppercase tracking-wide text-[var(--muted)]">
                <tr>
                  <SortHead label="Rank" active={sortKey === 'heat_rank'} dir={sortDir} onClick={() => toggleSort('heat_rank')} />
                  <th className="px-4 py-3 font-medium">Grid</th>
                  <SortHead label="Place" active={sortKey === 'neighborhood'} dir={sortDir} onClick={() => toggleSort('neighborhood')} />
                  <SortHead label="NDVI" active={sortKey === 'ndvi_index'} dir={sortDir} onClick={() => toggleSort('ndvi_index')} />
                  <th className="px-4 py-3 font-medium">Coordinates</th>
                  <SortHead label="Ground temp" active={sortKey === 'lst_celsius'} dir={sortDir} onClick={() => toggleSort('lst_celsius')} />
                  <th className="px-4 py-3 font-medium"><span className="sr-only">Open on map</span></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((item) => (
                  <tr key={item.id} className="border-b border-[var(--line)] last:border-0">
                    <td className="px-4 py-4 tabular-nums">{item.heat_rank}</td>
                    <td className="px-4 py-4 text-[var(--muted)]">{item.id}</td>
                    <td className="px-4 py-4 font-medium">{item.neighborhood}</td>
                    <td className="px-4 py-4 tabular-nums">{item.ndvi_index}</td>
                    <td className="px-4 py-4 tabular-nums text-[var(--muted)]">
                      {item.latitude}, {item.longitude}
                    </td>
                    <td className="px-4 py-4 tabular-nums">{formatTemp(item.lst_celsius)}</td>
                    <td className="px-4 py-4 text-right">
                      <Link href={`/map?lat=${item.latitude}&lon=${item.longitude}`} className="underline underline-offset-2">
                        Open map
                      </Link>
                    </td>
                  </tr>
                ))}
                {!rows.length && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-[var(--muted)]">
                      No rows match those filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Summary({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="panel px-4 py-5">
      <p className="text-[0.95rem] text-[var(--muted)]">{label}</p>
      <p className="metric mt-3 tabular-nums">{value}</p>
      {note && <p className="mt-1 text-sm text-[var(--muted)]">{note}</p>}
    </div>
  );
}

function SortHead({
  label,
  active,
  dir,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: 'asc' | 'desc';
  onClick: () => void;
}) {
  return (
    <th className="px-4 py-3 font-medium" aria-sort={active ? (dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
      <button type="button" onClick={onClick} className="min-h-10 hover:underline">
        {label}
        {active ? (dir === 'asc' ? ' up' : ' down') : ''}
      </button>
    </th>
  );
}
