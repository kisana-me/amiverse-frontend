import { useCallback } from 'react'
import { api } from '@/lib/axios'
import { useFeedTimeline, FeedPage, UseFeedTimelineReturn } from '@/hooks/useFeedTimeline'
import { CommunityTabKey } from '@/features/community/tabs'

type UseCommunityFeedsOptions = {
  aid?: string
  activeTab: CommunityTabKey
  statusReady: boolean
}

type UseCommunityFeedsReturn = {
  timelines: Record<CommunityTabKey, UseFeedTimelineReturn>
  activeTimeline: UseFeedTimelineReturn
  makeKey: (key: CommunityTabKey) => string
}

/**
 * コミュニティページのタブ（新着/お絵描き/メディア/おすすめ）ごとの
 * タイムラインをまとめて管理するフック。アクティブなタブのみ取得する。
 */
export function useCommunityFeeds({ aid, activeTab, statusReady }: UseCommunityFeedsOptions): UseCommunityFeedsReturn {
  const fetchCommunityPage = useCallback(
    async (filter: CommunityTabKey, cursor?: number): Promise<FeedPage | null> => {
      if (!aid) return null
      const res = await api.post('/feeds/community', { aid, filter, ...(cursor ? { cursor } : {}) })
      return (res.data ?? null) as FeedPage | null
    },
    [aid],
  )

  const fetchCurrent = useCallback((c?: number) => fetchCommunityPage('current', c), [fetchCommunityPage])
  const fetchDrawings = useCallback((c?: number) => fetchCommunityPage('drawings', c), [fetchCommunityPage])
  const fetchMedia = useCallback((c?: number) => fetchCommunityPage('media', c), [fetchCommunityPage])
  const fetchRecommended = useCallback((c?: number) => fetchCommunityPage('recommended', c), [fetchCommunityPage])

  const makeKey = useCallback((key: CommunityTabKey) => `community:${aid ?? 'pending'}:${key}`, [aid])

  const currentTimeline = useFeedTimeline({
    feedKey: makeKey('current'),
    fetchPage: fetchCurrent,
    enabled: !!aid && statusReady && activeTab === 'current',
    errorMessage: '投稿取得エラー',
  })
  const drawingsTimeline = useFeedTimeline({
    feedKey: makeKey('drawings'),
    fetchPage: fetchDrawings,
    enabled: !!aid && statusReady && activeTab === 'drawings',
    errorMessage: '投稿取得エラー',
  })
  const mediaTimeline = useFeedTimeline({
    feedKey: makeKey('media'),
    fetchPage: fetchMedia,
    enabled: !!aid && statusReady && activeTab === 'media',
    errorMessage: '投稿取得エラー',
  })
  const recommendedTimeline = useFeedTimeline({
    feedKey: makeKey('recommended'),
    fetchPage: fetchRecommended,
    enabled: !!aid && statusReady && activeTab === 'recommended',
    errorMessage: '投稿取得エラー',
  })

  const timelines: Record<CommunityTabKey, UseFeedTimelineReturn> = {
    current: currentTimeline,
    drawings: drawingsTimeline,
    media: mediaTimeline,
    recommended: recommendedTimeline,
  }

  return { timelines, activeTimeline: timelines[activeTab], makeKey }
}
