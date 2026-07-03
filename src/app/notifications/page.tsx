'use client'

import styles from './styles.module.css'
import { useEffect, useMemo, useState } from 'react'
import MainHeader from '@/components/main_header/MainHeader'
import PullToRefresh from '@/components/pull_to_refresh/PullToRefresh'
import InfiniteScrollSentinel from '@/components/infinite_scroll_sentinel/InfiniteScrollSentinel'
import { useNotifications } from '@/providers/NotificationsProvider'
import { useCurrentAccount } from '@/providers/CurrentAccountProvider'
import { formatRelativeTime } from '@/lib/format_time'
import Link from 'next/link'
import { NotificationType } from '@/types/notification'
import { AccountType } from '@/types/account'

// まとめ表示の対象。リアクション/拡散は同じ投稿ごと、フォローは全体でまとめる
const GROUPABLE_ACTIONS = ['reaction', 'diffuse', 'follow'] as const

const ACTION_ICONS: { [key: string]: string } = {
  reaction: '❤️',
  diffuse: '🔁',
  reply: '💬',
  quote: '✒️',
  follow: '👤',
  mention: '📢',
  signin: '🔑',
  system: '🔔',
}

const GROUP_MESSAGES: { [key: string]: string } = {
  reaction: 'あなたの投稿にリアクションしました',
  diffuse: 'あなたの投稿を拡散しました',
  follow: 'あなたをフォローしました',
}

type NotificationGroup = {
  key: string
  notifications: NotificationType[]
}

// 同じ投稿への同じ種類の通知（＋フォロー）をまとめる。位置は各グループ内の最新の通知に合わせる
const groupNotifications = (notifications: NotificationType[]): NotificationGroup[] => {
  const groups: NotificationGroup[] = []
  const groupIndex = new Map<string, number>()

  for (const notification of notifications) {
    const groupable = (GROUPABLE_ACTIONS as readonly string[]).includes(notification.action) && !!notification.actor
    const key = !groupable ? `single:${notification.aid}` : notification.action === 'follow' ? 'follow' : `${notification.action}:${notification.post?.aid ?? notification.aid}`

    const index = groupIndex.get(key)
    if (index === undefined) {
      groupIndex.set(key, groups.length)
      groups.push({ key, notifications: [notification] })
    } else {
      groups[index].notifications.push(notification)
    }
  }

  return groups
}

export default function Page() {
  const { notifications, isLoading, hasMore, fetchNotifications, markAsRead, permission, isSupported, subscribeToPush } = useNotifications()
  const { currentAccountStatus } = useCurrentAccount()
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    if (currentAccountStatus === 'loading') return

    fetchNotifications(true)
  }, [currentAccountStatus])

  useEffect(() => {
    // 画面離脱時に既読にする
    return () => {
      markAsRead()
    }
  }, [])

  const handleRefresh = async () => {
    if (isLoading) return
    setIsRefreshing(true)
    try {
      await fetchNotifications(true)
    } finally {
      setIsRefreshing(false)
    }
  }

  const groups = useMemo(() => groupNotifications(notifications), [notifications])

  const isLoadingMore = isLoading && !isRefreshing && notifications.length > 0

  return (
    <>
      <MainHeader>
        <div className="flex items-center justify-center w-full relative">
          <span>通知</span>
          <div className={styles.headerButtons}>
            <button onClick={handleRefresh} disabled={isLoading} className={`${styles.headerButton}${isRefreshing ? ` ${styles.refreshing}` : ''}`} title="更新">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                <path d="M21 3v5h-5"></path>
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                <path d="M8 16H3v5"></path>
              </svg>
            </button>
            <Link prefetch={false} href="/settings/notifications" className={styles.headerButton} title="通知設定">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </Link>
          </div>
        </div>
      </MainHeader>

      <PullToRefresh onRefresh={handleRefresh} refreshing={isRefreshing} disabled={isLoading && !isRefreshing}>
        {isSupported && permission === 'denied' && (
          <div className={styles.banner}>
            <div>
              <h3 className={styles.bannerTitle}>通知がブロックされています</h3>
              <p className={styles.bannerText}>ブラウザの設定から通知を許可に変更後、再読み込みしてください</p>
            </div>
            <button onClick={() => window.location.reload()} className={styles.bannerButton}>
              再読み込み
            </button>
          </div>
        )}

        {isSupported && permission === 'default' && (
          <div className={styles.banner}>
            <div>
              <h3 className={styles.bannerTitle}>プッシュ通知を有効にする</h3>
              <p className={styles.bannerText}>最新情報を受け取るには許可が必要です</p>
            </div>
            <button onClick={() => subscribeToPush()} className={styles.bannerButton}>
              通知を許可
            </button>
          </div>
        )}

        <div className={styles.page}>
          <div className={styles.list}>
            {groups.map((group) =>
              group.notifications.length > 1 ? <NotificationGroupItem key={group.key} group={group} /> : <NotificationItem key={group.notifications[0].aid} notification={group.notifications[0]} />,
            )}
          </div>

          {isLoading && notifications.length === 0 && <div className={styles.loading}>読み込み中...</div>}

          {notifications.length > 0 &&
            (hasMore ? <InfiniteScrollSentinel onIntersect={() => fetchNotifications()} isLoading={isLoadingMore} /> : <div className={styles.noMore}>これ以上通知はありません</div>)}

          {!isLoading && notifications.length === 0 && <div className={styles.empty}>通知はありません</div>}
        </div>
      </PullToRefresh>
    </>
  )
}

const ActorIcon = ({ actor }: { actor: AccountType }) => (
  <Link prefetch={false} href={`/@${actor.name_id}`} className={styles.actorLink}>
    <div className={styles.actorIcon}>{actor.icon_url ? <img src={actor.icon_url} alt={actor.name} width={32} height={32} /> : <div className={styles.defaultIcon} />}</div>
  </Link>
)

// まとめ表示（〇〇さんと他N人が…）。時間表記の位置に展開トグルを置き、開くと個別の通知を表示する
const NotificationGroupItem = ({ group }: { group: NotificationGroup }) => {
  const [expanded, setExpanded] = useState(false)
  const { notifications } = group
  const latest = notifications[0]
  const action = latest.action

  // 同じアカウントが複数回含まれる場合があるため、人数はユニークなアカウントで数える
  const actors = useMemo(() => {
    const seen = new Set<string>()
    const result: AccountType[] = []
    for (const notification of notifications) {
      const actor = notification.actor
      if (actor && !seen.has(actor.name_id)) {
        seen.add(actor.name_id)
        result.push(actor)
      }
    }
    return result
  }, [notifications])

  const hasUnread = notifications.some((n) => !n.checked)
  const others = actors.length - 1
  const message = `さん${others > 0 ? `と他${others}人` : ''}が${GROUP_MESSAGES[action] ?? '通知を送りました'}`
  const visibleActors = actors.slice(0, 8)

  return (
    <div className={`${styles.item} ${hasUnread ? styles.unread : ''}`}>
      <div className={styles.iconWrapper}>
        {hasUnread && <div className={styles.unreadIndicator}>New</div>}
        <div className={styles.icon}>{ACTION_ICONS[action] ?? '❔'}</div>
      </div>
      <div className={styles.content}>
        <div className={styles.actorIcons}>
          {visibleActors.map((actor) => (
            <ActorIcon key={actor.name_id} actor={actor} />
          ))}
          {actors.length > visibleActors.length && <span className={styles.actorIconsMore}>+{actors.length - visibleActors.length}</span>}
        </div>

        <div className={styles.body}>
          <span className={styles.actorName}>{actors[0].name}</span>
          <span className={styles.message}>{message}</span>
        </div>

        {latest.post && (
          <Link prefetch={false} href={`/posts/${latest.post.aid}`} className={styles.postPreview}>
            {latest.post.content ? latest.post.content.slice(0, 100) : '[メディアのみ投稿]'}
          </Link>
        )}

        <button className={styles.expandToggle} onClick={() => setExpanded((prev) => !prev)}>
          {expanded ? '表示を減らす' : `表示を増やす (${notifications.length}件)`}
        </button>

        {expanded && (
          <div className={styles.groupChildren}>
            {notifications.map((notification) => (
              <NotificationItem key={notification.aid} notification={notification} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const NotificationItem = ({ notification }: { notification: NotificationType }) => {
  const { action, actor, post, created_at, checked } = notification

  let title = ''
  let message = ''

  switch (action) {
    case 'reaction':
      message = 'さんがあなたの投稿にリアクションしました'
      break
    case 'diffuse':
      message = 'さんがあなたの投稿を拡散しました'
      break
    case 'reply':
      message = 'さんがあなたの投稿に返信しました'
      break
    case 'quote':
      message = 'さんがあなたの投稿を引用しました'
      break
    case 'follow':
      message = 'さんがあなたをフォローしました'
      break
    case 'mention':
      message = 'さんがあなたをメンションしました'
      break
    case 'signin':
      title = 'サインイン通知'
      message = '新しい端末からサインインがありました'
      break
    case 'system':
      title = 'システム通知'
      message = notification.content || ''
      break
    default:
      message = '新しい通知があります'
  }

  return (
    <div className={`${styles.item} ${!checked ? styles.unread : ''}`}>
      <div className={styles.iconWrapper}>
        {!checked && <div className={styles.unreadIndicator}>New</div>}
        <div className={styles.icon}>{ACTION_ICONS[action] ?? '❔'}</div>
      </div>
      <div className={styles.content}>
        {actor && (
          <div className={styles.header}>
            <ActorIcon actor={actor} />
          </div>
        )}

        <div className={styles.body}>
          {title && <div className={styles.title}>{title}</div>}
          {actor && <span className={styles.actorName}>{actor.name}</span>}
          <span className={styles.message}>{message}</span>
        </div>

        {post && (
          <Link prefetch={false} href={`/posts/${post.aid}`} className={styles.postPreview}>
            {post.content ? post.content.slice(0, 100) : '[メディアのみ投稿]'}
          </Link>
        )}

        <div className={styles.time}>{formatRelativeTime(new Date(created_at))}</div>
      </div>
    </div>
  )
}
