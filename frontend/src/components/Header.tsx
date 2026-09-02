'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useState } from 'react';
import { useApp } from '@/app/providers';
import { formatTemp, riskClass } from '@/lib/utils';

const LINKS = [
  { href: '/', label: 'Overview' },
  { href: '/map', label: 'Map' },
  { href: '/analytics', label: 'Data' },
  { href: '/about', label: 'About' },
];

export function Header() {
  const pathname = usePathname();
  const { weather, loading, lastUpdated, refresh } = useApp();
  const [open, setOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] backdrop-blur-md">
      <div className="h-1 bg-[var(--accent)]" />
      <div className="page !py-3 flex items-center justify-between gap-4">
        <div>
          <Link href="/" className="wordmark text-[1.7rem] text-[var(--heat)]">
            HeatLens
          </Link>
          <p className="text-[0.95rem] text-[var(--muted)]">Thane City heat watch</p>
        </div>

        <nav aria-label="Main" className="hidden md:flex items-center gap-1 text-[1.02rem] font-medium">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link key={link.href} href={link.href} className="nav-link" aria-current={active ? 'page' : undefined}>
                {link.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          className="btn-ghost btn md:hidden"
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? 'Close menu' : 'Open menu'}
        </button>
      </div>

      {open && (
        <nav id={menuId} aria-label="Mobile" className="md:hidden border-t border-[var(--line)] px-4 py-3 flex flex-col gap-2">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link key={link.href} href={link.href} className="nav-link" aria-current={active ? 'page' : undefined}>
                {link.label}
              </Link>
            );
          })}
        </nav>
      )}

      <div className="border-t border-[var(--line)] bg-[var(--surface)]">
        <div className="page !py-2.5 flex flex-wrap items-center justify-between gap-3 text-sm">
          <div className="flex flex-wrap items-center gap-2" aria-live="polite">
            {weather ? (
              <>
                <span className="chip">Air {formatTemp(weather.ambient_temp_celsius)}</span>
                <span className="chip">Humidity {weather.relative_humidity}%</span>
                <span className="chip">
                  Feels like {formatTemp(weather.heat_index_celsius)}
                  <span className={`badge ${riskClass(weather.risk_category)}`}>{weather.risk_category}</span>
                </span>
              </>
            ) : (
              <span className="text-[var(--muted)]">{loading ? 'Loading today’s conditions…' : 'Weather unavailable'}</span>
            )}
            {lastUpdated && (
              <span className="text-xs text-[var(--muted)]">
                Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
          <button type="button" className="btn-ghost btn !min-h-10 !text-sm" onClick={refresh} disabled={loading}>
            {loading ? 'Refreshing…' : 'Refresh data'}
          </button>
        </div>
      </div>
    </header>
  );
}
