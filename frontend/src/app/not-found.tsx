import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';

export default function NotFound() {
  return (
    <div className="page max-w-lg py-16">
      <PageHeader kicker="404" title="Page not found">
        That address is not part of HeatLens.
      </PageHeader>
      <Link href="/" className="btn inline-flex">
        Back to overview
      </Link>
    </div>
  );
}
