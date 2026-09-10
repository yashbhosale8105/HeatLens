export const NAV_LINKS = [
  { href: '/', label: 'Overview' },
  { href: '/map', label: 'Map' },
  { href: '/analytics', label: 'Data' },
  { href: '/about', label: 'About' },
] as const;

export type NavHref = (typeof NAV_LINKS)[number]['href'];

export function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }
  return pathname || '/';
}

export function isActivePath(pathname: string, href: string): boolean {
  const path = normalizePath(pathname);
  const target = normalizePath(href);
  if (target === '/') return path === '/';
  return path === target || path.startsWith(`${target}/`);
}

export function mapHref(lat: number, lon: number): string {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
  });
  return `/map?${params.toString()}`;
}

export function parseMapCoords(
  lat: string | null | undefined,
  lon: string | null | undefined
): { lat: number; lon: number } | null {
  if (lat == null || lon == null || lat.trim() === '' || lon.trim() === '') {
    return null;
  }
  const parsedLat = Number(lat);
  const parsedLon = Number(lon);
  if (!Number.isFinite(parsedLat) || !Number.isFinite(parsedLon)) return null;
  if (parsedLat < -90 || parsedLat > 90 || parsedLon < -180 || parsedLon > 180) {
    return null;
  }
  return { lat: parsedLat, lon: parsedLon };
}

/** In-page hash targets used by overlay / skip links. */
export function scrollToId(id: string, behavior: ScrollBehavior = 'smooth'): boolean {
  const el = document.getElementById(id.replace(/^#/, ''));
  if (!el) return false;
  el.scrollIntoView({ behavior, block: 'start' });
  return true;
}
