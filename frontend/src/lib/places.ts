import { Neighborhood } from './types';

export const THANE_CENTER = { lat: 19.2183, lon: 72.9781 };

export const THANE_BOUNDS = {
  southWest: { lat: 19.155, lon: 72.925 },
  northEast: { lat: 19.29, lon: 73.045 },
};

export const THANE_MAP_BOUNDS: [[number, number], [number, number]] = [
  [THANE_BOUNDS.southWest.lat, THANE_BOUNDS.southWest.lon],
  [THANE_BOUNDS.northEast.lat, THANE_BOUNDS.northEast.lon],
];

export function isInsideThane(lat: number, lon: number): boolean {
  return (
    lat >= THANE_BOUNDS.southWest.lat &&
    lat <= THANE_BOUNDS.northEast.lat &&
    lon >= THANE_BOUNDS.southWest.lon &&
    lon <= THANE_BOUNDS.northEast.lon
  );
}

export function clampToThane(lat: number, lon: number): { lat: number; lon: number } {
  return {
    lat: Math.min(THANE_BOUNDS.northEast.lat, Math.max(THANE_BOUNDS.southWest.lat, lat)),
    lon: Math.min(THANE_BOUNDS.northEast.lon, Math.max(THANE_BOUNDS.southWest.lon, lon)),
  };
}

export const QUICK_AREAS = [
  'Majiwada',
  'Ghodbunder Road',
  'Wagle Estate',
  'Kalwa',
  'Yeoor Hills',
  'Hiranandani Estate',
];

export const NEIGHBORHOODS: Neighborhood[] = [
  { name: 'Thane Central', lat: 19.2183, lon: 72.9781 },
  { name: 'Thane Station', lat: 19.1863, lon: 72.9756 },
  { name: 'Naupada', lat: 19.1978, lon: 72.9726 },
  { name: 'Panch Pakhadi', lat: 19.2048, lon: 72.9668 },
  { name: 'Teen Hath Naka', lat: 19.2065, lon: 72.9739 },
  { name: 'Court Naka', lat: 19.1942, lon: 72.9748 },
  { name: 'Jambli Naka', lat: 19.1948, lon: 72.9704 },
  { name: 'Talao Pali', lat: 19.1936, lon: 72.9678 },
  { name: 'Gokhale Road', lat: 19.1994, lon: 72.9691 },
  { name: 'Charai', lat: 19.2018, lon: 72.9742 },
  { name: 'Uthalsar', lat: 19.2086, lon: 72.9768 },
  { name: 'Kolbad', lat: 19.1892, lon: 72.9684 },
  { name: 'Kopri', lat: 19.1865, lon: 72.9782 },
  { name: 'Kopri Colony', lat: 19.1828, lon: 72.9814 },
  { name: 'Kalwa', lat: 19.1948, lon: 72.9986 },
  { name: 'Kalwa Bridge', lat: 19.1982, lon: 72.9912 },
  { name: 'Kalwa Hills', lat: 19.2016, lon: 73.0064 },
  { name: 'Parsik Hill', lat: 19.1884, lon: 73.0088 },
  { name: 'Mumbra', lat: 19.1762, lon: 73.0264 },
  { name: 'Kausa', lat: 19.1694, lon: 73.0218 },
  { name: 'Shil Phata', lat: 19.1628, lon: 73.0386 },
  { name: 'Diva', lat: 19.1881, lon: 73.0427 },
  { name: 'Diva Junction', lat: 19.1866, lon: 73.0462 },
  { name: 'Wagle Estate', lat: 19.185, lon: 72.952 },
  { name: 'Wagle Industrial Estate', lat: 19.1822, lon: 72.9486 },
  { name: 'Lokmanya Nagar', lat: 19.1914, lon: 72.9588 },
  { name: 'Vartak Nagar', lat: 19.2096, lon: 72.9612 },
  { name: 'Pokhran Road 1', lat: 19.2164, lon: 72.9622 },
  { name: 'Pokhran Road 2', lat: 19.2268, lon: 72.9658 },
  { name: 'Majiwada', lat: 19.2268, lon: 72.9844 },
  { name: 'Majiwada Junction', lat: 19.2294, lon: 72.986 },
  { name: 'Balkum', lat: 19.2326, lon: 72.9915 },
  { name: 'Balkum Naka', lat: 19.2352, lon: 72.9948 },
  { name: 'Kolshet', lat: 19.2388, lon: 72.9802 },
  { name: 'Kolshet Road', lat: 19.2364, lon: 72.9756 },
  { name: 'Dhokali', lat: 19.2416, lon: 72.9848 },
  { name: 'Manpada', lat: 19.2334, lon: 72.9721 },
  { name: 'Kapurbawdi', lat: 19.2241, lon: 72.9736 },
  { name: 'Cadbury Junction', lat: 19.2289, lon: 72.9698 },
  { name: 'Ghodbunder Road', lat: 19.245, lon: 72.971 },
  { name: 'Ghodbunder Service Road', lat: 19.2486, lon: 72.9688 },
  { name: 'Kasarvadavali', lat: 19.2672, lon: 72.9674 },
  { name: 'Owale', lat: 19.2586, lon: 72.9728 },
  { name: 'Ovala', lat: 19.2568, lon: 72.9702 },
  { name: 'Brahmand', lat: 19.2518, lon: 72.9645 },
  { name: 'Hiranandani Estate', lat: 19.2614, lon: 72.9796 },
  { name: 'Hiranandani Meadows', lat: 19.2562, lon: 72.9744 },
  { name: 'Anand Nagar', lat: 19.2542, lon: 72.9818 },
  { name: 'Kavesar', lat: 19.2466, lon: 72.9764 },
  { name: 'Waghbil', lat: 19.2724, lon: 72.9726 },
  { name: 'Gaimukh', lat: 19.2788, lon: 72.9682 },
  { name: 'Patlipada', lat: 19.2648, lon: 72.9742 },
  { name: 'Tikujiniwadi', lat: 19.2492, lon: 72.9586 },
  { name: 'Vijay Nagari', lat: 19.2526, lon: 72.9618 },
  { name: 'Yeoor Hills', lat: 19.24, lon: 72.94 },
  { name: 'Yeoor', lat: 19.2436, lon: 72.9368 },
  { name: 'Upvan Lake', lat: 19.2318, lon: 72.9514 },
  { name: 'Louis Wadi', lat: 19.2112, lon: 72.9695 },
  { name: 'Gladys Alvares Road', lat: 19.2188, lon: 72.9682 },
  { name: 'Thane Creek', lat: 19.2054, lon: 72.9981 },
  { name: 'Kharegaon', lat: 19.2148, lon: 73.0126 },
  { name: 'Bhayanderpada', lat: 19.2482, lon: 73.0024 },
  { name: 'Kalher', lat: 19.2686, lon: 73.0088 },
  { name: 'Mulund Check Naka', lat: 19.1768, lon: 72.9564 },
];

export function placeNameMatches(name: string, query: string): boolean {
  const n = name.toLowerCase();
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const nParts = n.split(/[^a-z0-9]+/).filter(Boolean);
  const qParts = q.split(/[^a-z0-9]+/).filter(Boolean);
  if (n.includes(q) || q.includes(n)) return true;
  return qParts.every((part) => nParts.some((word) => word.includes(part) || part.includes(word)));
}

export function resolvePlace(query: string, picked: Neighborhood | null, places: Neighborhood[]): Neighborhood | null {
  if (picked) return picked;
  const q = query.trim().toLowerCase();
  if (!q) return null;
  const exact = places.find((place) => place.name.toLowerCase() === q);
  if (exact) return exact;
  const matches = filterPlaces(places, query);
  return matches.length === 1 ? matches[0] : null;
}

export function rowsForArea<T extends { neighborhood: string; id: string }>(grid: T[], query: string): T[] {
  const q = query.trim();
  if (!q) return grid;
  return grid.filter((item) => placeNameMatches(item.neighborhood, q) || placeNameMatches(item.id, q));
}

export function filterPlaces(places: Neighborhood[], query: string): Neighborhood[] {
  const q = query.trim().toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ');
  if (!q) return places;

  return places.filter((place) => {
    const name = place.name.toLowerCase();
    const compact = name.replace(/[^a-z0-9]/g, '');
    const qCompact = q.replace(/\s+/g, '');
    return name.includes(q) || compact.includes(qCompact) || name.split(/\s+/).some((word) => word.startsWith(q));
  });
}

export function mergeThanePlaces(extra: Neighborhood[] = []): Neighborhood[] {
  const seen = new Set<string>();
  const merged: Neighborhood[] = [];

  for (const place of [...NEIGHBORHOODS, ...extra]) {
    const key = place.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(place);
  }

  return merged.sort((a, b) => a.name.localeCompare(b.name));
}

export function quickPlaces(): Neighborhood[] {
  return QUICK_AREAS.map((name) => NEIGHBORHOODS.find((place) => place.name === name)).filter(
    (place): place is Neighborhood => Boolean(place)
  );
}
