'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { GridRankItem, SourceStatus, WeatherData } from '@/lib/types';
import { fetchCurrentWeather, fetchGridRanks, fetchSourceStatus } from '@/lib/api';

interface AppContextType {
  weather: WeatherData | null;
  grid: GridRankItem[];
  source: SourceStatus | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
}

const AppContext = createContext<AppContextType>({
  weather: null,
  grid: [],
  source: null,
  loading: true,
  error: null,
  lastUpdated: null,
  refresh: async () => {},
});

export const useApp = () => useContext(AppContext);

export function Providers({ children }: { children: React.ReactNode }) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [grid, setGrid] = useState<GridRankItem[]>([]);
  const [source, setSource] = useState<SourceStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [weatherData, gridData, sourceData] = await Promise.all([
        fetchCurrentWeather(),
        fetchGridRanks(49),
        fetchSourceStatus(),
      ]);
      setWeather(weatherData);
      setGrid(gridData);
      setSource(sourceData);
      setLastUpdated(new Date());
    } catch {
      setError('Could not reach the HeatLens server. Start the backend on port 8000 and refresh.');
    } finally {
      setLoading(false);
    }
  }, []);

  // The satellite scene takes a few seconds to download on a cold start, so
  // keep checking until real readings replace the modelled stand-in.
  useEffect(() => {
    if (source?.source !== 'model' || source.status === 'no_usable_scene') return;
    pollRef.current = setTimeout(async () => {
      try {
        const next = await fetchSourceStatus();
        setSource(next);
        if (next.source === 'landsat') setGrid(await fetchGridRanks(49));
      } catch {
        // keep the current view; the next refresh will retry
      }
    }, 6000);
    return () => {
      if (pollRef.current) clearTimeout(pollRef.current);
    };
  }, [source]);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, 3 * 60 * 60 * 1000);
    return () => clearInterval(timer);
  }, [refresh]);

  return (
    <AppContext.Provider value={{ weather, grid, source, loading, error, lastUpdated, refresh }}>
      {children}
    </AppContext.Provider>
  );
}
