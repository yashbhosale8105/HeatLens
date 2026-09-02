'use client';

import { useMemo, useState } from 'react';
import { fetchPointTemp } from '@/lib/api';
import { Neighborhood, PointTempData } from '@/lib/types';
import { formatTemp } from '@/lib/utils';
import { PlaceSearch } from './PlaceSearch';

export function ComparePlaces({ places }: { places: Neighborhood[] }) {
  const [left, setLeft] = useState<PointTempData | null>(null);
  const [right, setRight] = useState<PointTempData | null>(null);
  const [leftName, setLeftName] = useState('First area');
  const [rightName, setRightName] = useState('Second area');
  const [busy, setBusy] = useState(false);

  async function pick(side: 'left' | 'right', place: Neighborhood) {
    setBusy(true);
    try {
      const data = await fetchPointTemp(place.lat, place.lon);
      if (side === 'left') {
        setLeft(data);
        setLeftName(place.name);
      } else {
        setRight(data);
        setRightName(place.name);
      }
    } finally {
      setBusy(false);
    }
  }

  const delta = useMemo(() => {
    if (!left || !right) return null;
    return Math.round((left.lst_celsius - right.lst_celsius) * 10) / 10;
  }, [left, right]);

  return (
    <div className="panel px-5 py-5 space-y-4">
      <div>
        <h2 className="text-[1.45rem]">Compare two areas</h2>
        <p className="text-[0.98rem] text-[var(--muted)]">See which neighbourhood is warmer on the ground.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <PlaceSearch compact places={places} label="First area" onSelect={(place) => pick('left', place)} />
        <PlaceSearch compact places={places} label="Second area" onSelect={(place) => pick('right', place)} />
      </div>
      {busy && <p className="text-[var(--muted)]">Comparing…</p>}
      <div className="grid gap-3 sm:grid-cols-3">
        <CompareCard name={leftName} reading={left} />
        <CompareCard name={rightName} reading={right} />
        <div className="panel !shadow-none px-4 py-4">
          <p className="text-[0.95rem] text-[var(--muted)]">Difference</p>
          <p className="metric mt-3 tabular-nums">
            {delta == null ? '—' : `${delta > 0 ? '+' : ''}${delta.toFixed(1)}°C`}
          </p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {delta == null
              ? 'Pick two places'
              : delta === 0
                ? 'Same ground heat'
                : delta > 0
                  ? `${leftName} is warmer`
                  : `${rightName} is warmer`}
          </p>
        </div>
      </div>
    </div>
  );
}

function CompareCard({ name, reading }: { name: string; reading: PointTempData | null }) {
  return (
    <div className="panel !shadow-none px-4 py-4">
      <p className="text-[0.95rem] text-[var(--muted)]">{name}</p>
      <p className="metric mt-3 tabular-nums">{reading ? formatTemp(reading.lst_celsius) : '—'}</p>
      <p className="mt-2 text-sm text-[var(--muted)]">{reading ? reading.vegetation_density : 'Not selected'}</p>
    </div>
  );
}
