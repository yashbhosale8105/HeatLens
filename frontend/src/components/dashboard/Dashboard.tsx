'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useApp } from '@/app/providers';
import { todayPlan } from '@/lib/advice';
import { fetchPointTemp } from '@/lib/api';
import { mergeThanePlaces, resolvePlace, rowsForArea } from '@/lib/places';
import { GridRankItem, Neighborhood } from '@/lib/types';
import { mapHref } from '@/lib/nav';
import { PageHeader } from '../PageHeader';
import { PlaceSearch } from '../PlaceSearch';
import { SourceNote } from '../SourceNote';
import { Spinner } from '../ui/Spinner';

export function Dashboard() {
  const { weather, grid, loading, error } = useApp();
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<Neighborhood | null>(null);
  const [areaRow, setAreaRow] = useState<GridRankItem | null>(null);
  const [areaLoading, setAreaLoading] = useState(false);
  const places = useMemo(
    () =>
      mergeThanePlaces(
        grid.map((item) => ({ name: item.neighborhood, lat: item.latitude, lon: item.longitude }))
      ),
    [grid]
  );

  const stats = useMemo(() => {
    const temps = grid.map((item) => item.lst_celsius);
    return {
      mean: mean(temps),
      hottest: grid[0],
      coolest: grid[grid.length - 1],
    };
  }, [grid]);

  const plan = todayPlan(weather);
  const resolved = useMemo(() => resolvePlace(query, picked, places), [query, picked, places]);

  useEffect(() => {
    if (!resolved) {
      setAreaRow(null);
      return;
    }
    let cancelled = false;
    setAreaLoading(true);
    fetchPointTemp(resolved.lat, resolved.lon)
      .then((point) => {
        if (cancelled) return;
        const hotter = grid.filter((item) => item.lst_celsius > point.lst_celsius).length;
        setAreaRow({
          id: `AREA-${resolved.name}`,
          neighborhood: resolved.name,
          latitude: resolved.lat,
          longitude: resolved.lon,
          lst_celsius: point.lst_celsius,
          ndvi_index: point.ndvi_index,
          data_source: point.data_source,
          heat_rank: hotter + 1,
        });
      })
      .finally(() => {
        if (!cancelled) setAreaLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [resolved, grid]);

  const rows = resolved ? (areaRow ? [areaRow] : []) : rowsForArea(grid, query);
  const filtered = Boolean(query.trim() || picked);

  return (
    <div className="page space-y-6">
      <PageHeader kicker="Thane City" title="How hot is it today?">
        Check the air, then type a neighbourhood or open it on the map.
      </PageHeader>

      {error && (
        <div className="panel border-[var(--heat)] px-4 py-3 text-sm text-[var(--heat)]" role="alert">
          {error}
        </div>
      )}

      <SourceNote />

      <div className="panel px-5 py-5">
        <p className="kicker">{plan.title}</p>
        <ul className="mt-3 space-y-1.5 leading-relaxed">
          {plan.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ul>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Air temperature" value={weather ? formatTemp(weather.ambient_temp_celsius) : '—'} />
        <Stat label="Humidity" value={weather ? `${weather.relative_humidity}%` : '—'} />
        <Stat
          label="How it feels"
          value={weather ? formatTemp(weather.heat_index_celsius) : '—'}
          note={weather ? <span className={`badge ${riskClass(weather.risk_category)}`}>{weather.risk_category}</span> : null}
        />
        <Stat label="Mean ground heat" value={grid.length ? formatTemp(stats.mean) : '—'} note={`Average of ${grid.length || 0} sample points`} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/map" className="panel block px-5 py-4 hover:bg-[#fff7ed]">
          <p className="font-semibold">Explore the map</p>
          <p className="mt-1 text-sm text-[var(--muted)]">Click a place or jump to a neighbourhood for a reading.</p>
        </Link>
        <Link href="/analytics" className="panel block px-5 py-4 hover:bg-[#fff7ed]">
          <p className="font-semibold">Browse the numbers</p>
          <p className="mt-1 text-sm text-[var(--muted)]">Search, sort, and download the sample table.</p>
        </Link>
      </div>

      <div className="panel overflow-visible">
        <div className="flex flex-col gap-3 border-b border-[var(--line)] px-5 py-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-[1.7rem]">Hottest to coolest</h2>
            <p className="text-[0.98rem] text-[var(--muted)]">
              {filtered
                ? `Showing ${rows.length} ${rows.length === 1 ? 'row' : 'rows'} for ${picked?.name || query}`
                : stats.hottest && stats.coolest
                  ? `${stats.hottest.neighborhood} is warmest. ${stats.coolest.neighborhood} is coolest.`
                  : 'Sample points across Thane'}
            </p>
            {filtered && (
              <button
                type="button"
                className="mt-2 text-sm underline underline-offset-2"
                onClick={() => {
                  setQuery('');
                  setPicked(null);
                }}
              >
                Show all areas
              </button>
            )}
          </div>
          <PlaceSearch
            places={places}
            value={query}
            onQueryChange={(value) => {
              setQuery(value);
              if (!value.trim()) setPicked(null);
            }}
            onSelect={(place) => {
              setQuery(place.name);
              setPicked(place);
            }}
          />
        </div>

        {(loading && !grid.length) || areaLoading ? (
          <Spinner label={areaLoading ? `Reading ${resolved?.name || 'that area'}` : 'Loading places'} />
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table w-full text-left text-sm">
              <caption className="sr-only">Neighbourhoods ranked from hottest to coolest surface temperature</caption>
              <thead className="border-b border-[var(--line)] text-xs uppercase tracking-wide text-[var(--muted)]">
                <tr>
                  <th className="px-5 py-3 font-medium">Rank</th>
                  <th className="px-5 py-3 font-medium">Place</th>
                  <th className="px-5 py-3 font-medium">Ground temp</th>
                  <th className="px-5 py-3 font-medium">Greenery</th>
                  <th className="px-5 py-3 font-medium"><span className="sr-only">Open on map</span></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((item) => {
                  const band = heatBand(item.lst_celsius);
                  const bandLabel = band === 'hot' ? 'Hot' : band === 'warm' ? 'Warm' : 'Cooler';
                  return (
                    <tr key={item.id} className="border-b border-[var(--line)] last:border-0">
                      <td className="px-5 py-4 tabular-nums">{item.heat_rank}</td>
                      <td className="px-5 py-4">
                        <div className="font-medium">{item.neighborhood}</div>
                        <div className="text-xs text-[var(--muted)]">
                          {formatCoord(item.latitude)}, {formatCoord(item.longitude)}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`badge ${band === 'hot' ? 'badge-hot' : band === 'warm' ? 'badge-warm' : 'badge-ok'}`}>
                          {formatTemp(item.lst_celsius)} · {bandLabel}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-[var(--muted)]">
                        {item.ndvi_index === null ? 'Not available' : `NDVI ${item.ndvi_index.toFixed(2)}`}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link href={mapHref(item.latitude, item.longitude)} className="btn-ghost btn !min-h-10 !px-3 !text-sm">
                          Open map
                        </Link>
                      </td>
                    </tr>
                  );
                })}
                {!rows.length && (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-[var(--muted)]">
                      No places match that search. Try another name.
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

function Stat({ label, value, note }: { label: string; value: string; note?: ReactNode }) {
  return (
    <div className="panel px-4 py-5">
      <p className="text-[0.95rem] text-[var(--muted)]">{label}</p>
      <p className="metric mt-3 tabular-nums">{value}</p>
      {note && <div className="mt-2 text-sm">{note}</div>}
    </div>
  );
}
