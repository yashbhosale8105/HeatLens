import { WeatherData, PointTempData, GridRankItem, HistoricalTrend, SourceStatus } from './types';
import { THANE_CENTER } from './places';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function fetchCurrentWeather(
  lat = THANE_CENTER.lat,
  lon = THANE_CENTER.lon
): Promise<WeatherData> {
  const res = await fetch(`${API_BASE_URL}/api/v1/weather/current?lat=${lat}&lon=${lon}`);
  if (!res.ok) throw new Error('Could not load weather');
  return res.json();
}

export async function fetchPointTemp(lat: number, lon: number): Promise<PointTempData> {
  const res = await fetch(`${API_BASE_URL}/api/v1/thermal/point?lat=${lat}&lon=${lon}`);
  if (!res.ok) throw new Error('Could not load surface temperature');
  return res.json();
}

export async function fetchGridRanks(count = 49): Promise<GridRankItem[]> {
  const res = await fetch(`${API_BASE_URL}/api/v1/thermal/grid?count=${count}`);
  if (!res.ok) throw new Error('Could not load grid readings');
  return res.json();
}

export async function fetchSourceStatus(): Promise<SourceStatus> {
  const res = await fetch(`${API_BASE_URL}/api/v1/thermal/source`);
  if (!res.ok) throw new Error('Could not load data source status');
  return res.json();
}

export async function fetchHistoricalTrends(): Promise<HistoricalTrend> {
  const res = await fetch(`${API_BASE_URL}/api/v1/thermal/historical`);
  if (!res.ok) throw new Error('Could not load trends');
  return res.json();
}

export function getExportUrl(format: 'geojson' | 'csv', count = 49): string {
  return `${API_BASE_URL}/api/v1/thermal/export?format=${format}&count=${count}`;
}
