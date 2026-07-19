'use client'

import MainHeader from '@/components/main_header/MainHeader'
import TabBar from '@/components/tab_bar/TabBar'
import TabContent from '@/components/tab_content/TabContent'
import PullToRefresh from '@/components/pull_to_refresh/PullToRefresh'
import FeedTimeline from '@/features/feed/components/FeedTimeline'
import ActionPrompt from '@/components/action_prompt/ActionPrompt'
import { useEffect, useState, useCallback, useRef } from 'react'
import { api } from '@/lib/axios'
import { useCurrentAccount } from '@/providers/CurrentAccountProvider'
import { useTabs } from '@/hooks/useTabs'
import { COMMUNITY_TABS, CommunityTabKey } from '@/features/community/tabs'
import { useCommunityFeeds } from '@/features/community/hooks/useCommunityFeeds'
import CommunityMainHeader from '@/features/community/components/CommunityMainHeader'
import CommunityBanner from '@/features/community/components/CommunityBanner'
import CommunityPlate from '@/features/community/components/CommunityPlate'
import CommunityProfile from '@/features/community/components/CommunityProfile'
import CommunitySkeleton from '@/features/community/components/CommunitySkeleton'
import styles from '@/features/community/styles/CommunityLayout.module.css'
import { CommunityType } from '@/types/community'

const HEADER_HEIGHT = 50

export default function CommunityContent({ aid, initialCommunity }: { aid: string; initialCommunity?: CommunityType | null }) {
  const [community, setCommunity] = useState<CommunityType | null>(initialCommunity || null)
  const [loading, setLoading] = useState<boolean>(!initialCommunity)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const { currentAccountStatus } = useCurrentAccount()

  const fetchCommunity = useCallback(async () => {
    try {
      const res = await api.post(`/communities/${aid}`)
      setCommunity((res.data ?? null) as CommunityType | null)
    } catch {
      setCommunity(null)
    }
  }, [aid])

  useEffect(() => {
    if (!aid) return
    if (currentAccountStatus === 'loading') return
    setLoading(!initialCommunity)
    fetchCommunity().finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aid, currentAccountStatus, fetchCommunity])

  const { tabs, activeTab, changeTab } = useTabs<CommunityTabKey>({
    tabs: COMMUNITY_TABS,
    defaultTab: 'current',
  })

  const statusReady = currentAccountStatus !== 'loading'
  const { timelines, activeTimeline, makeKey } = useCommunityFeeds({ aid: community?.aid, activeTab, statusReady })

  const tabBarRef = useRef<HTMLDivElement>(null)
  const getTabBarScrollTop = useCallback(() => {
    const el = tabBarRef.current
    if (!el) return 0
    return Math.max(0, el.getBoundingClientRect().top + window.scrollY - HEADER_HEIGHT)
  }, [])

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    try {
      await Promise.all([fetchCommunity(), activeTimeline.refresh()])
    } finally {
      setIsRefreshing(false)
    }
  }, [fetchCommunity, activeTimeline])

  const handleTabSelect = useCallback(
    (key: CommunityTabKey) => {
      if (key === activeTab) {
        if (window.scrollY > 0) {
          window.scrollTo({ top: 0, behavior: 'smooth' })
          return
        }
        if (!isRefreshing && !activeTimeline.isRefetching) handleRefresh()
        return
      }
      changeTab(key)
    },
    [activeTab, isRefreshing, activeTimeline, handleRefresh, changeTab],
  )

  return (
    <>
      <MainHeader>{community ? <CommunityMainHeader community={community} /> : <div>コミュニティ</div>}</MainHeader>

      {loading ? (
        <CommunitySkeleton />
      ) : community ? (
        <PullToRefresh onRefresh={handleRefresh} refreshing={isRefreshing || activeTimeline.isRefetching} disabled={loading || activeTimeline.isLoading}>
          <div className={styles.container}>
            <CommunityBanner community={community} />
            <CommunityPlate community={community} />
            <CommunityProfile community={community} />

            <div className={styles.tab} ref={tabBarRef}>
              <TabBar tabs={tabs} activeTab={activeTab} onTabChange={handleTabSelect} />
            </div>

            <div className={styles.content}>
              <TabContent tabKeys={tabs.map((t) => t.key)} activeTab={activeTab} onTabChange={changeTab} defaultScrollTop={getTabBarScrollTop}>
                {(tabKey) => {
                  const feedType = tabKey as CommunityTabKey
                  return <FeedTimeline timeline={timelines[feedType]} feedType={makeKey(feedType)} isActive={feedType === activeTab} infiniteScroll={feedType !== 'recommended'} />
                }}
              </TabContent>
            </div>
          </div>
        </PullToRefresh>
      ) : (
        <div className="p-4 text-center">コミュニティが見つかりません</div>
      )}

      <ActionPrompt href={`/posts/new?community=${aid}`} />
    </>
  )
}
