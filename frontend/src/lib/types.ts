export type RiskCategory =
  | 'Normal'
  | 'Caution'
  | 'Extreme Caution'
  | 'Danger'
  | 'Extreme Danger';

export interface WeatherData {
  ambient_temp_celsius: number;
  relative_humidity: number;
  wind_speed_kmh: number;
  uv_index: number;
  heat_index_celsius: number;
  risk_category: RiskCategory;
  risk_color: string;
  advisory: string;
  location_name: string;
}

export type DataSource = 'landsat' | 'model';

export interface PointTempData {
  latitude: number;
  longitude: number;
  lst_celsius: number;
  lst_fahrenheit: number;
  ndvi_index: number | null;
  vegetation_density: string;
  data_source: DataSource;
  satellite: string | null;
  band: string | null;
  acquisition_date: string | null;
  cloud_cover: number | null;
  scene_id: string | null;
  sample_radius_m: number | null;
  quality: string;
  note: string | null;
}

export interface GridRankItem {
  id: string;
  neighborhood: string;
  latitude: number;
  longitude: number;
  lst_celsius: number;
  ndvi_index: number | null;
  data_source: DataSource;
  heat_rank: number;
}

export interface SceneInfo {
  scene_id: string;
  platform: string;
  acquired: string;
  cloud_cover: number;
  usable_fraction: number;
  fetched_at: string;
  latest_pass: string | null;
  latest_pass_clear: number | null;
  collection: string;
  bands: string;
  resolution_m: number;
  provider: string;
}

export interface SourceStatus {
  source: DataSource;
  status: string;
  detail: string;
  scene: SceneInfo | null;
  city_stats: { min_celsius: number; mean_celsius: number; max_celsius: number } | null;
  model_note: string | null;
  checked_at: string;
}

export interface HistoricalRow {
  year: string;
  scene_date: string;
  mean_celsius: number;
  max_celsius: number;
  min_celsius: number;
  cloud_cover: number;
}

export interface HistoricalTrend {
  available: boolean;
  source: string;
  note: string;
  rows: HistoricalRow[];
}

export interface Neighborhood {
  name: string;
  lat: number;
  lon: number;
}
