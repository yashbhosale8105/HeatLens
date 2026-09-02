import { Neighborhood } from './types';

const KEY = 'heatlens-recent-places';

export function readRecents(): Neighborhood[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as Neighborhood[]) : [];
    return Array.isArray(parsed) ? parsed.slice(0, 5) : [];
  } catch {
    return [];
  }
}

export function pushRecent(place: Neighborhood): Neighborhood[] {
  const next = [place, ...readRecents().filter((item) => item.name !== place.name)].slice(0, 5);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore quota */
  }
  return next;
}
