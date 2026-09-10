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
import { SourceNote } from '../SourceNote';
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
  const startCoords =
    initialLat != null && initialLon != null && Number.isFinite(initialLat) && Number.isFinite(initialLon)
      ? { lat: initialLat, lon: initialLon }
      : null;
  const [userFocus, setUserFocus] = useState<{ lat: number; lon: number } | null>(null);
  const focus = userFocus ?? startCoords;
  const [selected, setSelected] = useState<PointTempData | null>(null);
  const [querying, setQuerying] = useState(Boolean(startCoords));
  const [copied, setCopied] = useState(false);
  const places = useMemo(
    () =>
      mergeThanePlaces(
        grid.map((item) => ({ name: item.neighborhood, lat: item.latitude, lon: item.longitude }))
      ),
    [grid]
  );
  const scale = useMemo(() => {
    const temps = grid.map((item) => item.lst_celsius);
    if (temps.length === 0) return { min: 20, max: 50 };
    return { min: Math.min(...temps), max: Math.max(...temps) };
  }, [grid]);

  useEffect(() => {
    if (initialLat == null || initialLon == null) return;
    if (!Number.isFinite(initialLat) || !Number.isFinite(initialLon)) return;
    let cancelled = false;
    fetchPointTemp(initialLat, initialLon)
      .then((data) => {
        if (!cancelled) setSelected(data);
      })
      .finally(() => {
        if (!cancelled) setQuerying(false);
      });
    return () => {
      cancelled = true;
    };
  }, [initialLat, initialLon]);

  async function jumpTo(place: Neighborhood) {
    setUserFocus({ lat: place.lat, lon: place.lon });
    setQuerying(true);
    try {
      setSelected(await fetchPointTemp(place.lat, place.lon));
    } finally {
      setQuerying(false);
    }
  }

  async function handleSelect(data: PointTempData) {
    setSelected(data);
    setUserFocus({ lat: data.latitude, lon: data.longitude });
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

      <div className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start">
      <div className="panel map-stage overflow-hidden">
        <div className="h-[480px] w-full sm:h-[600px] lg:h-[680px]" role="region" aria-label="Thane heat map">
          <HeatMap
            gridPoints={grid}
            showRaster={showRaster}
            showGrid={showGrid}
            opacity={opacity}
            focus={focus}
            preserveView={Boolean(startCoords)}
            selected={selected}
            onPointSelect={handleSelect}
          />
        </div>
        <div className="space-y-3 border-t border-[var(--line)] px-5 py-4">
          <div className="w-full">
            <p className="mb-1 text-xs text-[var(--muted)]">Ground temperature across Thane today</p>
            <div className="temp-bar" />
            <div className="mt-1 flex justify-between text-xs tabular-nums text-[var(--muted)]">
              <span>{formatTemp(scale.min)} coolest</span>
              <span>{formatTemp((scale.min + scale.max) / 2)}</span>
              <span>{formatTemp(scale.max)} hottest</span>
            </div>
          </div>
          <p className="text-sm text-[var(--muted)]">
            Only Thane is shown. Click anywhere inside the city outline to read that spot.
          </p>
          <SourceNote />
        </div>
      </div>

      <div className="panel px-5 py-5" aria-live="polite">
        {querying && <p className="text-[var(--muted)]">Reading that location…</p>}
        {!querying && !selected && (
          <p className="text-[var(--muted)]">Nothing selected yet. Choose a neighbourhood or click the map.</p>
        )}
        {selected && (
          <div className="space-y-4">
          <div className="grid gap-5 sm:grid-cols-2">
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
            </div>
            <div>
              <p className="text-sm text-[var(--muted)]">Greenery</p>
              <p className="mt-1 tabular-nums">
                {selected.ndvi_index === null ? 'Not available' : `NDVI ${selected.ndvi_index.toFixed(2)}`}
              </p>
              <p className="text-sm text-[var(--muted)]">{selected.vegetation_density}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--muted)]">Measured on</p>
              <p className="mt-1">{selected.acquisition_date ?? 'Not measured'}</p>
              <p className="text-sm text-[var(--muted)]">{selected.satellite ?? selected.quality}</p>
            </div>
          </div>
          {selected.note && <p className="text-sm text-[var(--heat)]">{selected.note}</p>}
          {selected.data_source === 'landsat' && (
            <p className="text-sm text-[var(--muted)]">
              {selected.quality}
              {selected.scene_id ? ` · scene ${selected.scene_id}` : ''}
            </p>
          )}
          <button
            type="button"
            className="btn-ghost btn !min-h-10 !text-sm"
            onClick={async () => {
              const provenance =
                selected.data_source === 'landsat'
                  ? `${selected.satellite} on ${selected.acquisition_date}`
                  : 'modelled estimate, not measured';
              const text = `HeatLens · ${formatTemp(selected.lst_celsius)} ground · ${formatCoord(selected.latitude)}, ${formatCoord(selected.longitude)} · ${provenance}`;
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
      </div>

      <ComparePlaces places={places} />
    </div>
  );
}
