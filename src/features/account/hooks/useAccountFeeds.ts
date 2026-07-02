import { useCallback } from 'react'
import { api } from '@/lib/axios'
import { useFeedTimeline, FeedPage, UseFeedTimelineReturn } from '@/hooks/useFeedTimeline'
import { AccountTabKey } from '@/features/account/tabs'

type UseAccountFeedsOptions = {
  aid?: string
  activeTab: AccountTabKey
  statusReady: boolean
}

type UseAccountFeedsReturn = {
  timelines: Record<AccountTabKey, UseFeedTimelineReturn>
  activeTimeline: UseFeedTimelineReturn
  makeKey: (key: AccountTabKey) => string
}

/**
 * アカウントページのタブごとのタイムラインをまとめて管理するフック。
 *
 * タブ（投稿/返信/メディア/お絵描き）それぞれに useFeedTimeline を用意し、
 * アクティブなタブのみ enabled にして取得する。
 */
export function useAccountFeeds({ aid, activeTab, statusReady }: UseAccountFeedsOptions): UseAccountFeedsReturn {
  const fetchAccountPage = useCallback(
    async (filter: AccountTabKey, cursor?: number): Promise<FeedPage | null> => {
      if (!aid) return null
      const res = await api.post('/feeds/account', { aid, filter, ...(cursor ? { cursor } : {}) })
      return (res.data ?? null) as FeedPage | null
    },
    [aid],
  )

  const fetchPosts = useCallback((c?: number) => fetchAccountPage('posts', c), [fetchAccountPage])
  const fetchReplies = useCallback((c?: number) => fetchAccountPage('replies', c), [fetchAccountPage])
  const fetchMedia = useCallback((c?: number) => fetchAccountPage('media', c), [fetchAccountPage])
  const fetchDrawings = useCallback((c?: number) => fetchAccountPage('drawings', c), [fetchAccountPage])

  const makeKey = useCallback((key: AccountTabKey) => `${aid ?? 'pending'}:${key}`, [aid])

  const postsTimeline = useFeedTimeline({
    feedKey: makeKey('posts'),
    fetchPage: fetchPosts,
    enabled: !!aid && statusReady && activeTab === 'posts',
    errorMessage: '投稿取得エラー',
  })
  const repliesTimeline = useFeedTimeline({
    feedKey: makeKey('replies'),
    fetchPage: fetchReplies,
    enabled: !!aid && statusReady && activeTab === 'replies',
    errorMessage: '投稿取得エラー',
  })
  const mediaTimeline = useFeedTimeline({
    feedKey: makeKey('media'),
    fetchPage: fetchMedia,
    enabled: !!aid && statusReady && activeTab === 'media',
    errorMessage: '投稿取得エラー',
  })
  const drawingsTimeline = useFeedTimeline({
    feedKey: makeKey('drawings'),
    fetchPage: fetchDrawings,
    enabled: !!aid && statusReady && activeTab === 'drawings',
    errorMessage: '投稿取得エラー',
  })

  const timelines: Record<AccountTabKey, UseFeedTimelineReturn> = {
    posts: postsTimeline,
    replies: repliesTimeline,
    media: mediaTimeline,
    drawings: drawingsTimeline,
  }

  return { timelines, activeTimeline: timelines[activeTab], makeKey }
}
