'use client'

import MainHeader from '@/components/main_header/MainHeader'
import TabBar from '@/components/tab_bar/TabBar'
import TabContent from '@/components/tab_content/TabContent'
import { useFeeds, FeedTypeKey } from '@/providers/FeedsProvider'
import { useFeedTimeline, FeedPage, UseFeedTimelineReturn } from '@/hooks/useFeedTimeline'
import FeedTimeline from '@/features/feed/components/FeedTimeline'
import { useEffect, useState, useCallback } from 'react'
import { api } from '@/lib/axios'
import ActionPrompt from '@/components/action_prompt/ActionPrompt'
import PullToRefresh from '@/components/pull_to_refresh/PullToRefresh'
import { GUEST_HOME_TABS, GuestTabKey } from './home_tabs'
import { useTabs } from '@/hooks/useTabs'

type HomeGuestProps = {
  initialTab: GuestTabKey
  initialFeedPage: FeedPage | null
}

export default function HomeGuest({ initialTab, initialFeedPage }: HomeGuestProps) {
  const { setCurrentFeedType } = useFeeds()

  const { tabs, activeTab, changeTab } = useTabs<GuestTabKey>({
    tabs: GUEST_HOME_TABS,
    defaultTab: initialTab,
  })

  // SSR と初回クライアント描画ではアクティブタブのみ描画し、非アクティブタブの空HTMLを載せない
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  useEffect(() => {
    setCurrentFeedType(activeTab)
    const newUrl = activeTab === 'recommended' ? '/' : `/?tab=${activeTab}`
    window.history.replaceState(null, '', newUrl)
  }, [activeTab, setCurrentFeedType])

  const fetchFeedPage = useCallback(async (type: FeedTypeKey, cursor?: number): Promise<FeedPage | null> => {
    const res = await api.post(`/feeds/${type}`, cursor ? { cursor } : undefined)
    return (res.data ?? null) as FeedPage | null
  }, [])

  const fetchCurrent = useCallback((cursor?: number) => fetchFeedPage('current', cursor), [fetchFeedPage])
  const fetchRecommended = useCallback((cursor?: number) => fetchFeedPage('recommended', cursor), [fetchFeedPage])

  const currentTimeline = useFeedTimeline({
    feedKey: 'current',
    fetchPage: fetchCurrent,
    enabled: activeTab === 'current',
    errorMessage: 'タイムライン取得エラー',
    initialData: initialTab === 'current' ? initialFeedPage : undefined,
  })
  const recommendedTimeline = useFeedTimeline({
    feedKey: 'recommended',
    fetchPage: fetchRecommended,
    enabled: activeTab === 'recommended',
    errorMessage: 'タイムライン取得エラー',
    initialData: initialTab === 'recommended' ? initialFeedPage : undefined,
  })

  const timelines: Record<GuestTabKey, UseFeedTimelineReturn> = {
    current: currentTimeline,
    recommended: recommendedTimeline,
  }
  const activeTimeline = timelines[activeTab]

  const handleTabSelect = useCallback(
    (key: GuestTabKey) => {
      if (key === activeTab) {
        if (window.scrollY > 0) {
          window.scrollTo({ top: 0, behavior: 'smooth' })
          return
        }
        if (!activeTimeline.isRefetching && !activeTimeline.isLoading) activeTimeline.refresh()
        return
      }
      changeTab(key)
    },
    [activeTab, activeTimeline, changeTab],
  )

  return (
    <>
      <MainHeader>
        <TabBar tabs={tabs} activeTab={activeTab} onTabChange={handleTabSelect} />
      </MainHeader>

      <PullToRefresh onRefresh={activeTimeline.refresh} refreshing={activeTimeline.isRefetching} disabled={activeTimeline.isLoading}>
        <TabContent tabKeys={tabs.map((t) => t.key)} activeTab={activeTab} onTabChange={changeTab}>
          {(tabKey, isActive) => {
            const feedType = tabKey as GuestTabKey
            if (!isActive && !mounted) return null
            return <FeedTimeline timeline={timelines[feedType]} feedType={feedType} isActive={isActive} infiniteScroll={feedType !== 'recommended'} />
          }}
        </TabContent>
      </PullToRefresh>

      <ActionPrompt />
    </>
  )
}
