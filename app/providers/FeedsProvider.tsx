"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useMemo,
} from "react";

type FeedItem = {
  type: "post";
  aid: string;
};

export type FeedData = {
  type: string;
  objects: FeedItem[];
};

type CachedFeed = {
  objects: FeedItem[];
  fetched_at: number;
};

type FeedsContextType = {
  feeds: Record<string, CachedFeed>;
  addFeed: (feed: FeedData) => void;
  getFeed: (type: string) => FeedItem[] | undefined;
};

const FeedsContext = createContext<FeedsContextType | null>(null);

export const FeedsProvider = ({ children }: { children: ReactNode }) => {
  const [feeds, setFeeds] = useState<Record<string, CachedFeed>>({});

  const addFeed = useCallback((feed: FeedData) => {
    const now = Date.now();
    setFeeds((prev) => {
      const existing = prev[feed.type];
      if (!existing || now >= existing.fetched_at) {
        return {
          ...prev,
          [feed.type.toString()]: {
            objects: feed.objects,
            fetched_at: now,
          },
        };
      }
      return prev;
    });
  }, []);

  const getFeed = useCallback((type: string) => {
    return feeds[type]?.objects;
  }, [feeds]);

  const value: FeedsContextType = useMemo(() => ({
    feeds,
    addFeed,
    getFeed,
  }), [feeds, addFeed, getFeed]);

  return (
    <FeedsContext.Provider value={value}>
      {children}
    </FeedsContext.Provider>
  );
};

export const useFeeds = () => {
  const context = useContext(FeedsContext);
  if (!context) throw new Error("useFeeds must be used within a FeedsProvider");
  return context;
};
