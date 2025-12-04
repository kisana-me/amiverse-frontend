"use client";

import "./style.css";
import { useEffect } from "react";
import MainHeader from '../components/main_header/MainHeader';
import { useNotifications } from "@/app/providers/NotificationsProvider";
import { useCurrentAccount } from "@/app/providers/CurrentAccountProvider";
import { formatRelativeTime } from "@/app/lib/format_time";
import Link from "next/link";
import Image from "next/image";
import { NotificationType } from "@/types/notification";

export default function Page() {
  const { notifications, isLoading, hasMore, fetchedAt, fetchNotifications, markAsRead } = useNotifications();
  const { currentAccountStatus } = useCurrentAccount();

  useEffect(() => {
    if (currentAccountStatus === "loading") return;

    fetchNotifications(true);
  }, [currentAccountStatus]);

  useEffect(() => {
    // 画面離脱時に既読にする
    return () => {
      markAsRead();
    };
  }, []);

  const handleLoadMore = () => {
    fetchNotifications();
  };

  return (
    <>
      <MainHeader>
        通知
      </MainHeader>
      
      <div style={{ padding: '0.5rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#888', borderBottom: '1px solid var(--border-color)' }}>
        <div>
          {fetchedAt ? `最終更新: ${new Date(fetchedAt).toLocaleString()}` : '未取得'}
        </div>
        <button onClick={() => fetchNotifications(true)} disabled={isLoading} style={{ cursor: 'pointer', background: 'none', border: '1px solid currentColor', borderRadius: '4px', padding: '2px 8px', color: 'inherit', opacity: isLoading ? 0.5 : 1 }}>
          {isLoading ? '更新中...' : '再読み込み'}
        </button>
      </div>

      <div className="notifications-page">
        <div className="notifications-list">
          {notifications.map((notification) => (
            <NotificationItem key={notification.aid} notification={notification} />
          ))}
        </div>

        {isLoading && <div className="loading">読み込み中...</div>}

        {!isLoading && hasMore && (
          <button className="load-more-button" onClick={handleLoadMore}>
            もっと見る
          </button>
        )}

        {!isLoading && !hasMore && notifications.length > 0 && (
          <div className="no-more">これ以上通知はありません</div>
        )}

        {!isLoading && notifications.length === 0 && (
          <div className="empty-state">通知はありません</div>
        )}
      </div>
    </>
  );
}

const NotificationItem = ({ notification }: { notification: NotificationType }) => {
  const { action, actor, post, created_at, checked } = notification;

  let title = "";
  let message = "";
  let icon = "";

  switch (action) {
    case "reaction":
      message = "さんがあなたの投稿にリアクションしました";
      icon = "❤️"; 
      break;
    case "diffuse":
      message = "さんがあなたの投稿を拡散しました";
      icon = "🔁";
      break;
    case "reply":
      message = "さんがあなたの投稿に返信しました";
      icon = "💬";
      break;
    case "quote":
      message = "さんがあなたの投稿を引用しました";
      icon = "✒️";
      break;
    case "follow":
      message = "さんがあなたをフォローしました";
      icon = "👤";
      break;
    case "mention":
      message = "さんがあなたをメンションしました";
      icon = "📢";
      break;
    case "signin":
      title = "サインイン通知";
      message = "新しい端末からサインインがありました";
      icon = "🔑";
      break;
    case "system":
      title = "システム通知";
      message = notification.content || "";
      icon = "🔔";
      break;
    default:
      message = "新しい通知があります";
      icon = "🔔";
  }

  return (
    <div className={`notification-item ${!checked ? "notification-unread" : ""}`}>
      <div className="notification-icon-wrapper">
        {!checked && <div className="notification-unread-indicator">New</div>}
        <div className="notification-icon">{icon}</div>
      </div>
      <div className="notification-content">
        <div className="notification-header">
          {actor && (
            <Link href={`/@${actor.name_id}`} className="actor-link">
              <div className="actor-icon">
                {actor.icon_url ? (
                  <img src={actor.icon_url} alt={actor.name} width={32} height={32} className="rounded-full" />
                ) : (
                  <div className="default-icon" />
                )}
              </div>
            </Link>
          )}
        </div>
        
        <div className="notification-body">
            {title && <div style={{ fontWeight: 'bold' }} className="notification-title">{title}</div>}
            {actor && <span className="actor-name">{actor.name}</span>}
            <span className="notification-message">{message}</span>
        </div>

        {post && (
          <Link href={`/posts/${post.aid}`} className="notification-post-preview">
            {post.content ? post.content.slice(0, 100) : <div className="notification-post-media">[メディアのみ投稿]</div>}
          </Link>
        )}
        
        <div className="notification-time">{formatRelativeTime(new Date(created_at))}</div>
      </div>
    </div>
  );
};
