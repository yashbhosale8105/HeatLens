import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { RiskCategory } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTemp(celsius: number): string {
  return `${celsius.toFixed(1)}°C`;
}

export function formatCoord(value: number): string {
  return value.toFixed(4);
}

export function heatBand(temp: number): 'hot' | 'warm' | 'cool' {
  if (temp >= 42) return 'hot';
  if (temp >= 36) return 'warm';
  return 'cool';
}

export function riskClass(category: RiskCategory | string): string {
  switch (category) {
    case 'Extreme Danger':
    case 'Danger':
      return 'badge-hot';
    case 'Extreme Caution':
    case 'Caution':
      return 'badge-warm';
    default:
      return 'badge-ok';
  }
}

export function mean(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}
