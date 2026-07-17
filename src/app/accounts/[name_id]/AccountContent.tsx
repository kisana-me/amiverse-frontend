'use client'

import MainHeader from '@/components/main_header/MainHeader'
import TabBar from '@/components/tab_bar/TabBar'
import TabContent from '@/components/tab_content/TabContent'
import PullToRefresh from '@/components/pull_to_refresh/PullToRefresh'
import FeedTimeline from '@/features/feed/components/FeedTimeline'
import { useEffect, useState, useCallback, useRef } from 'react'
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
import { AccountType } from '@/types/account'

const HEADER_HEIGHT = 50

export default function AccountContent({ name_id, initialAccount }: { name_id: string; initialAccount?: AccountType | null }) {
  const { accounts, fetchAccount, seedAccount } = useAccounts()

  const account = accounts[name_id] || initialAccount || null
  const [loading, setLoading] = useState<boolean>(!(accounts[name_id] || initialAccount))
  const aid = account?.aid

  const { currentAccountStatus, currentAccount } = useCurrentAccount()
  const isOwnAccount = currentAccountStatus === 'signed_in' && !!account && currentAccount?.aid === account.aid

  const [isAccountRefreshing, setIsAccountRefreshing] = useState(false)

  useEffect(() => {
    if (initialAccount && !accounts[name_id]) {
      seedAccount(name_id, initialAccount)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name_id])

  useEffect(() => {
    if (!name_id) return
    if (currentAccountStatus === 'loading') return

    if (accounts[name_id] || initialAccount) {
      setLoading(false)
    } else {
      setLoading(true)
      fetchAccount(name_id).finally(() => {
        setLoading(false)
      })
    }
  }, [name_id, currentAccountStatus, fetchAccount, accounts, initialAccount])

  const { tabs, activeTab, changeTab } = useTabs<AccountTabKey>({
    tabs: ACCOUNT_TABS,
    defaultTab: 'posts',
  })

  const statusReady = currentAccountStatus !== 'loading'
  const { timelines, activeTimeline, makeKey } = useAccountFeeds({ aid, activeTab, statusReady })

  const { handleFollow, handleMenu, menuModal, reportModal } = useAccountActions({ account, name_id })

  const tabBarRef = useRef<HTMLDivElement>(null)
  const getTabBarScrollTop = useCallback(() => {
    const el = tabBarRef.current
    if (!el) return 0
    return Math.max(0, el.getBoundingClientRect().top + window.scrollY - HEADER_HEIGHT)
  }, [])

  const handleRefresh = useCallback(async () => {
    setIsAccountRefreshing(true)
    try {
      await Promise.all([fetchAccount(name_id, { force: true }), activeTimeline.refresh()])
    } finally {
      setIsAccountRefreshing(false)
    }
  }, [name_id, fetchAccount, activeTimeline])

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
