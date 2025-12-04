"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { api } from "@/app/lib/axios";
import { NotificationType } from "@/types/notification";
import { useCurrentAccount } from "./CurrentAccountProvider";

type NotificationsContextType = {
  notifications: NotificationType[];
  isLoading: boolean;
  hasMore: boolean;
  fetchedAt: Date | null;
  unreadCount: number;
  fetchNotifications: (refresh?: boolean) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: () => void;
};

const NotificationsContext = createContext<NotificationsContextType | null>(null);

export const NotificationsProvider = ({ children }: { children: React.ReactNode }) => {
  const { currentAccountStatus } = useCurrentAccount();
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);
  const [fetchedAt, setFetchedAt] = useState<Date | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    if (currentAccountStatus !== "signed_in") return;
    try {
      const response = await api.post("/notifications/unread_count");
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  }, [currentAccountStatus]);

  const fetchNotifications = useCallback(async (refresh = false) => {
    if (isLoading) return;
    if (currentAccountStatus === "loading") return;

    setIsLoading(true);

    try {
      const currentCursor = refresh ? null : cursor;
      const response = await api.post("/notifications", {
        cursor: currentCursor,
      });

      const newNotifications = response.data.data;
      const nextCursor = response.headers["x-next-cursor"];

      setNotifications((prev: NotificationType[]) => {
        if (refresh) return newNotifications;
        // 重複排除
        const existingIds = new Set(prev.map((n) => n.aid));
        const uniqueNewNotifications = newNotifications.filter(
          (n: NotificationType) => !existingIds.has(n.aid)
        );
        return [...prev, ...uniqueNewNotifications];
      });

      if (refresh) {
        setFetchedAt(new Date());
        setUnreadCount(0);
      }

      setCursor(nextCursor || null);
      setHasMore(!!nextCursor);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setIsLoading(false);
    }
  }, [cursor, isLoading, currentAccountStatus]);

  const markAsRead = useCallback(() => {
    setNotifications((prev: NotificationType[]) =>
      prev.map((n) => ({ ...n, checked: true }))
    );
    setUnreadCount(0);
  }, []);

  // 定期的に未読件数を取得する（例: 60秒ごと）
  React.useEffect(() => {
    if (currentAccountStatus === "signed_in") {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 60000);
      return () => clearInterval(interval);
    }
  }, [currentAccountStatus, fetchUnreadCount]);

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        isLoading,
        hasMore,
        fetchedAt,
        unreadCount,
        fetchNotifications,
        fetchUnreadCount,
        markAsRead,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationsProvider");
  }
  return context;
};
