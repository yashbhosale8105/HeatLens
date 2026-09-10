'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { MapView } from '@/components/map/MapView';
import { PageHeader } from '@/components/PageHeader';
import { Spinner } from '@/components/ui/Spinner';
import { parseMapCoords } from '@/lib/nav';

function MapInner() {
  const params = useSearchParams();
  const coords = parseMapCoords(params.get('lat'), params.get('lon'));

  return (
    <div className="page">
      <PageHeader kicker="Explore" title="Map">
        Type a Thane area, or click anywhere on the map to read the ground temperature.
      </PageHeader>
      <MapView
        key={`${coords?.lat ?? 'none'}:${coords?.lon ?? 'none'}`}
        initialLat={coords?.lat}
        initialLon={coords?.lon}
      />
    </div>
  );
}

export default function MapPage() {
  return (
    <Suspense fallback={<Spinner label="Opening map" />}>
      <MapInner />
    </Suspense>
  );
}
