'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '@/app/providers';
import { isActivePath, NAV_LINKS } from '@/lib/nav';
import { formatTemp, riskClass } from '@/lib/utils';

const QUICK_ACTIONS = [
  { href: '/map', label: 'Open map' },
  { href: '/analytics', label: 'Browse data' },
] as const;

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { weather, loading, lastUpdated, refresh } = useApp();
  const [open, setOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  function go(href: string) {
    setOpen(false);
    if (href.startsWith('#')) {
      const id = href.slice(1);
      window.setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
      return;
    }
    router.push(href);
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] backdrop-blur-md">
        <div className="h-1 bg-[var(--accent)]" />
        <div className="page !py-3 flex items-center justify-between gap-4">
          <div>
            <Link href="/" className="wordmark text-[1.7rem] text-[var(--heat)]" onClick={() => setOpen(false)}>
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
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            className="btn-ghost btn"
            aria-expanded={open}
            aria-controls={menuId}
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? 'Close menu' : 'Menu'}
          </button>
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

      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="nav-overlay" id={menuId} role="dialog" aria-modal="true" aria-label="Site menu">
            <button type="button" className="nav-overlay-close" aria-label="Close" onClick={() => setOpen(false)}>
              ×
            </button>
            <div className="nav-overlay-grid">
              <div className="nav-overlay-aside">
                <p className="kicker">Quick actions</p>
                <ul className="mt-3 space-y-2">
                  {QUICK_ACTIONS.map((action) => (
                    <li key={action.href}>
                      <button type="button" className="nav-overlay-action" onClick={() => go(action.href)}>
                        {action.label}
                      </button>
                    </li>
                  ))}
                </ul>
                <p className="kicker mt-8">On this page</p>
                <button type="button" className="nav-overlay-action mt-3" onClick={() => go('#main')}>
                  Jump to content
                </button>
              </div>
              <nav className="nav-overlay-links" aria-label="Pages">
                {NAV_LINKS.map((link) => {
                  const active = isActivePath(pathname, link.href);
                  return (
                    <button
                      key={link.href}
                      type="button"
                      className="nav-overlay-link"
                      aria-current={active ? 'page' : undefined}
                      onClick={() => go(link.href)}
                    >
                      {link.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
