'use client';

import React from 'react';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { MapContainerWrapper } from '@/components/map/MapContainerWrapper';

export default function MapPage() {
  return (
    <div className="space-y-6">
      <SectionTitle
        title="Thermal Map Explorer"
        subtitle="High-resolution Landsat 8 ST_B10 surface skin temperature layer over Thane City"
        icon="🗺️"
      />
      <MapContainerWrapper />
    </div>
  );
}

