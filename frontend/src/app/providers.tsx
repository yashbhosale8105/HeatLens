'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { GridRankItem, WeatherData } from '@/lib/types';
import { fetchCurrentWeather, fetchGridRanks } from '@/lib/api';

interface AppContextType {
  weather: WeatherData | null;
  grid: GridRankItem[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
}

const AppContext = createContext<AppContextType>({
  weather: null,
  grid: [],
  loading: true,
  error: null,
  lastUpdated: null,
  refresh: async () => {},
});

export const useApp = () => useContext(AppContext);

export function Providers({ children }: { children: React.ReactNode }) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [grid, setGrid] = useState<GridRankItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [weatherData, gridData] = await Promise.all([fetchCurrentWeather(), fetchGridRanks(25)]);
      setWeather(weatherData);
      setGrid(gridData);
      setLastUpdated(new Date());
    } catch {
      setError('Could not reach the HeatLens server. Start the backend on port 8000 and refresh.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, 3 * 60 * 60 * 1000);
    return () => clearInterval(timer);
  }, [refresh]);

  return (
    <AppContext.Provider value={{ weather, grid, loading, error, lastUpdated, refresh }}>
      {children}
    </AppContext.Provider>
  );
}
