import React from 'react';

export function SectionTitle({ title, subtitle, icon }: { title: string; subtitle?: string; icon?: string }) {
  return (
    <div className="mb-6 space-y-1">
      <h2 className="text-xl font-bold flex items-center gap-2 text-slate-100">
        {icon && <span>{icon}</span>}
        <span>{title}</span>
      </h2>
      {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
    </div>
  );
}
