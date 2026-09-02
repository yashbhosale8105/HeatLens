import { Analytics } from '@/components/analytics/Analytics';
import { PageHeader } from '@/components/PageHeader';

export default function AnalyticsPage() {
  return (
    <div className="page">
      <PageHeader kicker="Numbers" title="Data">
        Search, filter, and export the Thane sample grid. Charts show recent seasonal change.
      </PageHeader>
      <Analytics />
    </div>
  );
}
