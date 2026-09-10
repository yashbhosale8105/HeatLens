'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useId } from 'react';
import { useApp } from '@/app/providers';
import { isActivePath, NAV_LINKS } from '@/lib/nav';
import { formatTemp, riskClass } from '@/lib/utils';

const QUICK_ACTIONS = [
  { href: '/map', label: 'Open map' },
  { href: '/analytics', label: 'Browse data' },
] as const;

function closeMenu(menuId: string) {
  const checkbox = document.getElementById(menuId) as HTMLInputElement | null;
  if (checkbox) checkbox.checked = false;
}

export function Header() {
  const pathname = usePathname();
  const { weather, loading, lastUpdated, refresh } = useApp();
  const menuId = useId();

  useEffect(() => {
    closeMenu(menuId);
  }, [pathname, menuId]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMenu(menuId);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuId]);

  return (
    <>
      <input type="checkbox" id={menuId} className="nav-toggle-input" />
      <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] backdrop-blur-md">
        <div className="h-1 bg-[var(--accent)]" />
        <div className="page !py-3 flex items-center justify-between gap-4">
          <div>
            <Link href="/" className="wordmark text-[1.7rem] text-[var(--heat)]" onClick={() => closeMenu(menuId)}>
              HeatLens
            </Link>
            <p className="text-[0.95rem] text-[var(--muted)]">Thane City heat watch</p>
          </div>

          <nav aria-label="Main" className="hidden md:flex items-center gap-1 text-[1.02rem] font-medium">
            {NAV_LINKS.map((link) => {
              const active = isActivePath(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="nav-link"
                  aria-current={active ? 'page' : undefined}
                  onClick={() => closeMenu(menuId)}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <label htmlFor={menuId} className="btn-ghost btn nav-toggle-label">
            <span className="nav-toggle-open">Menu</span>
            <span className="nav-toggle-close">Close menu</span>
          </label>
        </div>

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

      <div className="nav-overlay" role="dialog" aria-label="Site menu">
        <label htmlFor={menuId} className="nav-overlay-close" aria-label="Close">
          ×
        </label>
        <div className="nav-overlay-grid">
          <div className="nav-overlay-aside">
            <p className="kicker">Quick actions</p>
            <ul className="mt-3 space-y-2">
              {QUICK_ACTIONS.map((action) => (
                <li key={action.href}>
                  <Link href={action.href} className="nav-overlay-action" onClick={() => closeMenu(menuId)}>
                    {action.label}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="kicker mt-8">On this page</p>
            <a href="#main" className="nav-overlay-action mt-3 inline-block" onClick={() => closeMenu(menuId)}>
              Jump to content
            </a>
          </div>
          <nav className="nav-overlay-links" aria-label="Pages">
            {NAV_LINKS.map((link) => {
              const active = isActivePath(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="nav-overlay-link"
                  aria-current={active ? 'page' : undefined}
                  onClick={() => closeMenu(menuId)}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}
