'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', href: '/', icon: '📊' },
    { label: 'Thermal Map', href: '/map', icon: '🗺️' },
    { label: 'Grid Analytics', href: '/analytics', icon: '📈' },
    { label: 'About & Docs', href: '/about', icon: 'ℹ️' },
  ];

  return (
    <aside className="w-64 border-r border-slate-200 bg-white p-4 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-4rem)] shadow-sm">
      <div className="space-y-6">
        <div className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
          Navigation
        </div>
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-rose-50 text-rose-700 border border-rose-200 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
        <div className="flex items-center justify-between text-slate-900 font-bold">
          <span>Satellite Engine</span>
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-500">
          Landsat 8 ST_B10 collection active over Thane City.
        </p>
      </div>
    </aside>
  );
}
