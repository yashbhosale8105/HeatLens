import React from 'react';

export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const dim = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-10 h-10' : 'w-6 h-6';
  return (
    <div className={`inline-block ${dim} animate-spin rounded-full border-2 border-slate-700 border-t-rose-500`} />
  );
}
