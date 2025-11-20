"use client";

import {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useState,
} from "react";

export type TrendType = {
  category: string
  image_url: string
  title: string
  overview: string
  last_updated_at: Date
  ranking: {
    word: string
    count: number
  }[]
}

type TrendsContextType = {
  trends: TrendType[];
  trendsLoading: boolean;
};

export const TrendsContext = createContext<TrendsContextType | null>(null);

export function TrendsProvider({ children }: { children: React.ReactNode }) {
  const [ trends, setTrends ] = useState<TrendType[]>([]);
  const [ trendsLoading, setTrendsLoading ] = useState<boolean>(true);

  const fetchTrend = useCallback(async (category: string = "general") => {
    setTrendsLoading(true);
    try {
      const res = await fetch(`/api/trends?category=${category}`);
      const data = await res.json();
      if (!data) return;
      const newItems: TrendType[] = Array.isArray(data) ? data : [data];
      setTrends((prev) => {
        const filtered = prev.filter((item) => item.category !== category);
        return [...filtered, ...newItems];
      });
    } catch (error) {
      // Toast
      console.error("fetchTrend error:", error);
    } finally {
      setTrendsLoading(false);
    }
  }, []);

  useEffect(() => {
    async function load() {
      await fetchTrend("general");
    }
    load();
  }, []);

  const value: TrendsContextType = {
    trends,
    trendsLoading,
  };
  return (
    <TrendsContext.Provider value={value}>
      {children}
    </TrendsContext.Provider>
  );
};

export function useTrends() {
  const context = useContext(TrendsContext);
  if (!context) throw new Error("useTrends must be used within a TrendProvider");
  return context;
};
