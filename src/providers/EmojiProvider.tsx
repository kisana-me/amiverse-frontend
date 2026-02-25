"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { api } from '@/lib/axios';
import { EmojiType } from '@/types/emoji';

interface EmojiContextType {
  groups: string[];
  emojisByGroup: Record<string, EmojiType[]>;
  fetchGroups: () => Promise<void>;
  fetchEmojisByGroup: (group: string) => Promise<void>;
  getEmoji: (name_id: string) => Promise<EmojiType | null>;
}

const EmojiContext = createContext<EmojiContextType | undefined>(undefined);

export const EmojiProvider = ({ children }: { children: React.ReactNode }) => {
  const [groups, setGroups] = useState<string[]>([]);
  const [emojisByGroup, setEmojisByGroup] = useState<Record<string, EmojiType[]>>({});
  const [emojiCache, setEmojiCache] = useState<Record<string, EmojiType>>({});
  
  const emojisByGroupRef = React.useRef(emojisByGroup);
  React.useEffect(() => {
    emojisByGroupRef.current = emojisByGroup;
  }, [emojisByGroup]);

  const emojiCacheRef = React.useRef(emojiCache);
  React.useEffect(() => {
    emojiCacheRef.current = emojiCache;
  }, [emojiCache]);

  const fetchingGroups = React.useRef<Set<string>>(new Set());

  const fetchGroups = useCallback(async () => {
    if (groups.length > 0) return;
    try {
      const res = await api.post('/emojis/groups');
      if (res.data.groups) {
        setGroups(res.data.groups);
      }
    } catch (error) {
      console.error("Failed to fetch emoji groups", error);
    }
  }, [groups]);

  const fetchEmojisByGroup = useCallback(async (group: string) => {
    if (emojisByGroupRef.current[group] || fetchingGroups.current.has(group)) return;
    
    fetchingGroups.current.add(group);
    try {
      const res = await api.post(`/emojis/groups/${encodeURIComponent(group)}`);
      const data = res.data;

      if (Array.isArray(data)) {
        setEmojisByGroup(prev => ({ ...prev, [group]: data }));
        
        const newCache: Record<string, EmojiType> = {};
        data.forEach((emoji: EmojiType) => {
            newCache[emoji.name_id] = emoji;
        });
        setEmojiCache(prev => ({...prev, ...newCache}));
      } else {
        console.error("Fetch emojis response is not array:", data);
      }
    } catch (error) {
      console.error(`Failed to fetch emojis for group ${group}`, error);
    } finally {
      fetchingGroups.current.delete(group);
    }
  }, []);

  const getEmoji = useCallback(async (name_id: string) => {
      if (emojiCacheRef.current[name_id]) return emojiCacheRef.current[name_id];
      try {
        const res = await api.post(`/emojis/${encodeURIComponent(name_id)}`);
        if (res.data) {
            setEmojiCache(prev => ({...prev, [name_id]: res.data}));
            return res.data;
        }
      } catch (error) {
        console.error(`Failed to fetch emoji ${name_id}`, error);
      }
      return null;
  }, []);

  return (
    <EmojiContext.Provider value={{ groups, emojisByGroup, fetchGroups, fetchEmojisByGroup, getEmoji }}>
      {children}
    </EmojiContext.Provider>
  );
};

export const useEmoji = () => {
  const context = useContext(EmojiContext);
  if (context === undefined) {
    throw new Error('useEmoji must be used within a EmojiProvider');
  }
  return context;
};
