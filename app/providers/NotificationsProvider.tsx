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
  subscribeToPush: () => Promise<void>;
  permission: NotificationPermission;
  isSupported: boolean;
};

const VAPID_PUBLIC_KEY = 'BJxDjmXijZoQMGfNhUVO14-VqE-UcOVCWFYydHbG3v4ogG7Q9IM0j9gckT30B3hD_XLJGsII7-gbhSkeC7VhXG8=';

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const NotificationsContext = createContext<NotificationsContextType | null>(null);

export const NotificationsProvider = ({ children }: { children: React.ReactNode }) => {
  const { currentAccountStatus } = useCurrentAccount();
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);
  const [fetchedAt, setFetchedAt] = useState<Date | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  React.useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const subscribeToPush = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    if (currentAccountStatus !== "signed_in") return;

    try {
      // Service Workerを登録
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      // Service Workerがアクティブになるのを待つ
      await navigator.serviceWorker.ready;

      let subscription = await registration.pushManager.getSubscription();

      // 既存のサブスクリプションがない場合は新規登録
      if (!subscription) {
        const convertedVapidKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey
        });
      }

      await api.post('/push_subscriptions', subscription);
      setPermission(Notification.permission);
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      // エラー詳細をログに出力
      if (error instanceof Error) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
      }
      setPermission(Notification.permission);
    }
  }, [currentAccountStatus]);

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
      if (Notification.permission === 'granted') {
        subscribeToPush();
      }
      const interval = setInterval(fetchUnreadCount, 60000);
      return () => clearInterval(interval);
    }
  }, [currentAccountStatus, fetchUnreadCount, subscribeToPush]);

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
        subscribeToPush,
        permission,
        isSupported,
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
