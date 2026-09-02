'use client';

import React from 'react';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { AnalyticsPanel } from '@/components/analytics/AnalyticsPanel';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <SectionTitle
        title="Micro-Grid Heat Analytics"
        subtitle="Ranked 500m urban grid points from highest surface heat to coolest green buffer zones"
        icon="📈"
      />
      <AnalyticsPanel />
    </div>
  );
}
