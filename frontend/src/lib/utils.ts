import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTemp(celsius: number): string {
  return `${celsius.toFixed(1)}°C`;
}

export function getRiskBadgeClass(category: string): string {
  switch (category) {
    case 'Extreme Danger':
      return 'bg-red-900/40 text-red-400 border-red-500/50';
    case 'Danger':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'Extreme Caution':
      return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case 'Caution':
      return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    default:
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  }
}
