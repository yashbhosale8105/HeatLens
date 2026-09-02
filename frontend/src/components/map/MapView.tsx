'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { useApp } from '@/app/providers';
import { fetchPointTemp } from '@/lib/api';
import { mergeThanePlaces } from '@/lib/places';
import { Neighborhood, PointTempData } from '@/lib/types';
import { formatCoord, formatTemp } from '@/lib/utils';
import { ComparePlaces } from '../ComparePlaces';
import { PlaceSearch } from '../PlaceSearch';
import { Spinner } from '../ui/Spinner';

const HeatMap = dynamic(() => import('./HeatMap'), {
  ssr: false,
  loading: () => <Spinner label="Loading map" />,
});

interface MapViewProps {
  initialLat?: number;
  initialLon?: number;
}

export function MapView({ initialLat, initialLon }: MapViewProps) {
  const { grid, error } = useApp();
  const [showRaster, setShowRaster] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [opacity, setOpacity] = useState(0.7);
  const [focus, setFocus] = useState<{ lat: number; lon: number } | null>(
    initialLat && initialLon ? { lat: initialLat, lon: initialLon } : null
  );
  const [selected, setSelected] = useState<PointTempData | null>(null);
  const [querying, setQuerying] = useState(false);
  const [copied, setCopied] = useState(false);
  const places = useMemo(
    () =>
      mergeThanePlaces(
        grid.map((item) => ({ name: item.neighborhood, lat: item.latitude, lon: item.longitude }))
      ),
    [grid]
  );

  useEffect(() => {
    if (initialLat == null || initialLon == null) return;
    const next = { lat: initialLat, lon: initialLon };
    setFocus(next);
    setQuerying(true);
    fetchPointTemp(next.lat, next.lon)
      .then(setSelected)
      .finally(() => setQuerying(false));
  }, [initialLat, initialLon]);

  async function jumpTo(place: Neighborhood) {
    setFocus({ lat: place.lat, lon: place.lon });
    setQuerying(true);
    try {
      setSelected(await fetchPointTemp(place.lat, place.lon));
    } finally {
      setQuerying(false);
    }
  }

  async function handleSelect(data: PointTempData) {
    setSelected(data);
    setFocus({ lat: data.latitude, lon: data.longitude });
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="panel px-4 py-3 text-sm text-[var(--heat)]" role="alert">
          {error}
        </div>
      )}

      <div className="panel map-toolbar flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-end lg:justify-between">
        <PlaceSearch places={places} onSelect={jumpTo} />

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <label className="check text-sm">
            <input type="checkbox" checked={showRaster} onChange={(e) => setShowRaster(e.target.checked)} />
            Show heat overlay
          </label>
          <label className="check text-sm">
            <input type="checkbox" checked={showGrid} onChange={(e) => setShowGrid(e.target.checked)} />
            Show sample points
          </label>
          {showRaster && (
            <label className="min-w-44 text-sm text-[var(--muted)]">
              Overlay {Math.round(opacity * 100)}%
              <input
                className="mt-1 w-full"
                type="range"
                min={0.2}
                max={1}
                step={0.05}
                value={opacity}
                aria-valuetext={`${Math.round(opacity * 100)} percent`}
                onChange={(e) => setOpacity(Number(e.target.value))}
              />
            </label>
          )}
        </div>
      </div>

      <div className="panel map-stage overflow-hidden">
        <div className="h-[560px] w-full" role="region" aria-label="Thane heat map">
          <HeatMap
            gridPoints={grid}
            showRaster={showRaster}
            showGrid={showGrid}
            opacity={opacity}
            focus={focus}
            selected={selected}
            onPointSelect={handleSelect}
          />
        </div>
        <div className="flex flex-col gap-3 border-t border-[var(--line)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full max-w-md">
            <p className="mb-1 text-xs text-[var(--muted)]">Ground temperature scale</p>
            <div className="temp-bar" />
            <div className="mt-1 flex justify-between text-xs text-[var(--muted)]">
              <span>20°C cooler</span>
              <span>35°C</span>
              <span>50°C hotter</span>
            </div>
          </div>
          <p className="text-sm text-[var(--muted)]">Click anywhere on the map to read that spot.</p>
        </div>
      </div>

      <div className="panel px-5 py-5" aria-live="polite">
        {querying && <p className="text-[var(--muted)]">Reading that location…</p>}
        {!querying && !selected && (
          <p className="text-[var(--muted)]">Nothing selected yet. Choose a neighbourhood or click the map.</p>
        )}
        {selected && (
          <div className="space-y-4">
          <div className="grid gap-5 sm:grid-cols-4">
            <div>
              <p className="text-sm text-[var(--muted)]">Ground temperature</p>
              <p className="metric mt-1 tabular-nums">{formatTemp(selected.lst_celsius)}</p>
              <p className="text-sm text-[var(--muted)]">{selected.lst_fahrenheit}°F</p>
            </div>
            <div>
              <p className="text-sm text-[var(--muted)]">Location</p>
              <p className="mt-1">
                {formatCoord(selected.latitude)}, {formatCoord(selected.longitude)}
              </p>
              <p className="text-sm text-[var(--muted)]">{selected.vegetation_density}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--muted)]">Greenery</p>
              <p className="mt-1 tabular-nums">NDVI {selected.ndvi_index}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--muted)]">Reading date</p>
              <p className="mt-1">{selected.acquisition_date}</p>
              <p className="text-sm text-[var(--muted)]">{selected.satellite}</p>
            </div>
          </div>
          <button
            type="button"
            className="btn-ghost btn !min-h-10 !text-sm"
            onClick={async () => {
              const text = `HeatLens · ${formatTemp(selected.lst_celsius)} ground · ${formatCoord(selected.latitude)}, ${formatCoord(selected.longitude)}`;
              try {
                await navigator.clipboard.writeText(text);
                setCopied(true);
                setTimeout(() => setCopied(false), 1600);
              } catch {
                setCopied(false);
              }
            }}
          >
            {copied ? 'Copied' : 'Copy this reading'}
          </button>
          </div>
        )}
      </div>

      <ComparePlaces places={places} />
    </div>
  );
}
