import React from 'react';
import { cn } from '@/lib/utils';

export function Card({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-2xl bg-slate-900/60 border border-slate-800/80 p-5 backdrop-blur-md shadow-xl hover:border-slate-700/80 transition-all',
        onClick && 'cursor-pointer hover:scale-[1.01]',
        className
      )}
    >
      {children}
    </div>
  );
}
