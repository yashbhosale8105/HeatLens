import Link from 'next/link';
import { NAV_LINKS } from '@/lib/nav';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="page !py-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p>HeatLens · Thane City · Air from Open-Meteo · Ground samples across neighbourhoods</p>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-4 gap-y-2">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="underline-offset-2 hover:underline">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
