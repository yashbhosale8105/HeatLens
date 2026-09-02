export interface WeatherData {
  ambient_temp_celsius: number;
  relative_humidity: number;
  wind_speed_kmh: number;
  uv_index: number;
  heat_index_celsius: number;
  risk_category: 'Normal' | 'Caution' | 'Extreme Caution' | 'Danger' | 'Extreme Danger';
  risk_color: string;
  advisory: string;
  location_name: string;
}

export interface PointTempData {
  latitude: number;
  longitude: number;
  lst_celsius: number;
  lst_fahrenheit: number;
  ndvi_index: number; // -1.0 to +1.0
  vegetation_density: 'Dense Forest' | 'Moderate Greenery' | 'Low Vegetation' | 'Built-up Concrete';
  satellite: string;
  band: string;
  acquisition_date: string;
  cloud_cover: number;
  qa_pixel_mask: string;
}

export interface GridRankItem {
  id: string;
  neighborhood: string;
  latitude: number;
  longitude: number;
  lst_celsius: number;
  ndvi_index: number;
  heat_rank: number;
}

export interface OverlayMetadata {
  center: [number, number];
  bounds: [[number, number], [number, number]];
  palette: string[];
  min_temp: number;
  max_temp: number;
  units: string;
}

export interface NeighborhoodLocation {
  name: string;
  lat: number;
  lon: number;
  type: string;
}
