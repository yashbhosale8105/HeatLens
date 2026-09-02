'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { WeatherData } from '@/lib/types';
import { fetchCurrentWeather } from '@/lib/api';

interface AppContextType {
  weather: WeatherData | null;
  loading: boolean;
  refreshWeather: () => Promise<void>;
  selectedCoords: { lat: number; lon: number } | null;
  setSelectedCoords: (coords: { lat: number; lon: number } | null) => void;
}

const AppContext = createContext<AppContextType>({
  weather: null,
  loading: true,
  refreshWeather: async () => {},
  selectedCoords: null,
  setSelectedCoords: () => {}
});

export const useApp = () => useContext(AppContext);

export function Providers({ children }: { children: React.ReactNode }) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lon: number } | null>({
    lat: 19.2183,
    lon: 72.9781
  });

  const refreshWeather = async () => {
    setLoading(true);
    const data = await fetchCurrentWeather();
    setWeather(data);
    setLoading(false);
  };

  useEffect(() => {
    refreshWeather();
    const interval = setInterval(refreshWeather, 3 * 60 * 60 * 1000); // 3-hour auto refresh
    return () => clearInterval(interval);
  }, []);

  return (
    <AppContext.Provider value={{ weather, loading, refreshWeather, selectedCoords, setSelectedCoords }}>
      {children}
    </AppContext.Provider>
  );
}
