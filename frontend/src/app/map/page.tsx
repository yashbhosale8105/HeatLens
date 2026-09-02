'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { MapView } from '@/components/map/MapView';
import { PageHeader } from '@/components/PageHeader';
import { Spinner } from '@/components/ui/Spinner';

function MapInner() {
  const params = useSearchParams();
  const lat = params.get('lat');
  const lon = params.get('lon');

  return (
    <div className="page">
      <PageHeader kicker="Explore" title="Map">
        Type a Thane area, or click anywhere on the map to read the ground temperature.
      </PageHeader>
      <MapView initialLat={lat ? Number(lat) : undefined} initialLon={lon ? Number(lon) : undefined} />
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
