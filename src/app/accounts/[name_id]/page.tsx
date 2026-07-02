'use client'

import MainHeader from '@/components/main_header/MainHeader'
import TabBar from '@/components/tab_bar/TabBar'
import TabContent from '@/components/tab_content/TabContent'
import PullToRefresh from '@/components/pull_to_refresh/PullToRefresh'
import FeedTimeline from '@/features/feed/components/FeedTimeline'
import { use, useEffect, useState, useCallback, useRef } from 'react'
import { useAccounts } from '@/providers/AccountsProvider'
import { useCurrentAccount } from '@/providers/CurrentAccountProvider'
import { useTabs } from '@/hooks/useTabs'
import { ACCOUNT_TABS, AccountTabKey } from '@/features/account/tabs'
import { useAccountFeeds } from '@/features/account/hooks/useAccountFeeds'
import { useAccountActions } from '@/features/account/hooks/useAccountActions'
import AccountMainHeader from '@/features/account/components/AccountMainHeader'
import AccountBanner from '@/features/account/components/AccountBanner'
import AccountPlate from '@/features/account/components/AccountPlate'
import AccountProfile from '@/features/account/components/AccountProfile'
import AccountMenuModal from '@/features/account/components/AccountMenuModal'
import AccountReportModal from '@/features/account/components/AccountReportModal'
import AccountSkeleton from '@/features/account/components/AccountSkeleton'
import styles from '@/features/account/styles/AccountLayout.module.css'

type Props = {
  params: Promise<{
    name_id: string
  }>
}

// MainHeader (.main-header) の高さ。未訪問タブ切替時の基準スクロール算出に使う
const HEADER_HEIGHT = 50

export default function Page({ params }: Props) {
  const { name_id } = use(params)
  return <AccountContent name_id={name_id} key={name_id} />
}

function AccountContent({ name_id }: { name_id: string }) {
  const { accounts, fetchAccount } = useAccounts()

  const [loading, setLoading] = useState<boolean>(!accounts[name_id])
  const account = accounts[name_id] || null
  const aid = account?.aid

  const { currentAccountStatus, currentAccount } = useCurrentAccount()
  const isOwnAccount = currentAccountStatus === 'signed_in' && !!account && currentAccount?.aid === account.aid

  const [isAccountRefreshing, setIsAccountRefreshing] = useState(false)

  useEffect(() => {
    if (!name_id) return
    if (currentAccountStatus === 'loading') return

    if (accounts[name_id]) {
      setLoading(false)
    } else {
      setLoading(true)
      fetchAccount(name_id).finally(() => {
        setLoading(false)
      })
    }
  }, [name_id, currentAccountStatus, fetchAccount, accounts])

  // --- タブ状態 ---
  const { tabs, activeTab, changeTab } = useTabs<AccountTabKey>({
    tabs: ACCOUNT_TABS,
    defaultTab: 'posts',
  })

  // --- タブごとのタイムライン ---
  const statusReady = currentAccountStatus !== 'loading'
  const { timelines, activeTimeline, makeKey } = useAccountFeeds({ aid, activeTab, statusReady })

  // --- アカウント操作（フォロー / ブロック / 通報）とモーダル ---
  const { handleFollow, handleMenu, menuModal, reportModal } = useAccountActions({ account, name_id })

  // 未訪問タブに切り替えたときの基準スクロール位置。
  // ページ最上部（バナー）まで戻らず、タブバーがヘッダー直下に来る位置に合わせる。
  const tabBarRef = useRef<HTMLDivElement>(null)
  const getTabBarScrollTop = useCallback(() => {
    const el = tabBarRef.current
    if (!el) return 0
    return Math.max(0, el.getBoundingClientRect().top + window.scrollY - HEADER_HEIGHT)
  }, [])

  // Pull-to-Refresh / タブ再クリックでアカウント情報とタイムラインを一緒に更新する
  const handleRefresh = useCallback(async () => {
    setIsAccountRefreshing(true)
    try {
      await Promise.all([fetchAccount(name_id, { force: true }), activeTimeline.refresh()])
    } finally {
      setIsAccountRefreshing(false)
    }
  }, [name_id, fetchAccount, activeTimeline])

  // アクティブなタブを再クリック: スクロール中なら最上部へ、最上部なら再読み込み
  const handleTabSelect = useCallback(
    (key: AccountTabKey) => {
      if (key === activeTab) {
        if (window.scrollY > 0) {
          window.scrollTo({ top: 0, behavior: 'smooth' })
          return
        }
        if (!isAccountRefreshing && !activeTimeline.isRefetching) handleRefresh()
        return
      }
      changeTab(key)
    },
    [activeTab, isAccountRefreshing, activeTimeline, handleRefresh, changeTab],
  )

  return (
    <>
      <MainHeader>{account ? <AccountMainHeader account={account} isOwnAccount={isOwnAccount} onFollow={handleFollow} /> : <div>Account</div>}</MainHeader>

      {loading ? (
        <AccountSkeleton />
      ) : account ? (
        <PullToRefresh onRefresh={handleRefresh} refreshing={isAccountRefreshing || activeTimeline.isRefetching} disabled={loading || activeTimeline.isLoading}>
          <div className={styles.container}>
            <AccountBanner account={account} />
            <AccountPlate account={account} isOwnAccount={isOwnAccount} onFollow={handleFollow} onMenu={handleMenu} />
            <AccountProfile account={account} />

            <div className={styles.tab} ref={tabBarRef}>
              <TabBar tabs={tabs} activeTab={activeTab} onTabChange={handleTabSelect} />
            </div>

            <div className={styles.content}>
              <TabContent tabKeys={tabs.map((t) => t.key)} activeTab={activeTab} onTabChange={changeTab} defaultScrollTop={getTabBarScrollTop}>
                {(tabKey) => {
                  const feedType = tabKey as AccountTabKey
                  return <FeedTimeline timeline={timelines[feedType]} feedType={makeKey(feedType)} isActive={feedType === activeTab} />
                }}
              </TabContent>
            </div>

            <AccountMenuModal {...menuModal} />
            <AccountReportModal {...reportModal} />
          </div>
        </PullToRefresh>
      ) : (
        <div className="p-4 text-center">アカウントが見つかりません</div>
      )}
    </>
  )
}
