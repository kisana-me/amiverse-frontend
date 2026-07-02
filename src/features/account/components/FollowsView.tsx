'use client'

import MainHeader from '@/components/main_header/MainHeader'
import TabBar from '@/components/tab_bar/TabBar'
import TabContent from '@/components/tab_content/TabContent'
import OneLine from '@/components/Account/OneLine'
import { api } from '@/lib/axios'
import { AccountType } from '@/types/account'
import { useCallback, useEffect, useState } from 'react'
import { useAccounts } from '@/providers/AccountsProvider'
import { useCurrentAccount } from '@/providers/CurrentAccountProvider'
import { useToast } from '@/providers/ToastProvider'
import { useTabs } from '@/hooks/useTabs'
import { useAccountActions } from '../hooks/useAccountActions'
import AccountMainHeader from './AccountMainHeader'
import styles from '../styles/AccountLayout.module.css'

export type FollowsTabKey = 'following' | 'followers'

const FOLLOWS_TABS: { key: FollowsTabKey; label: string }[] = [
  { key: 'following', label: 'フォロー' },
  { key: 'followers', label: 'フォロワー' },
]

const EMPTY_MESSAGES: Record<FollowsTabKey, string> = {
  following: 'まだ誰もフォローしていません',
  followers: 'まだフォロワーがいません',
}

type Props = {
  name_id: string
  initialTab: FollowsTabKey
}

/**
 * フォロー / フォロワー一覧ページの本体。
 *
 * /@[name_id]/following と /@[name_id]/followers の両ルートから使われ、
 * タブ切り替え時は再マウントを避けるため pushState でパスだけ差し替える。
 */
export default function FollowsView({ name_id, initialTab }: Props) {
  const { accounts, fetchAccount } = useAccounts()
  const { currentAccountStatus, currentAccount } = useCurrentAccount()
  const { addToast } = useToast()

  const account = accounts[name_id] || null
  const aid = account?.aid
  const isOwnAccount = currentAccountStatus === 'signed_in' && !!account && currentAccount?.aid === account.aid

  const { handleFollow } = useAccountActions({ account, name_id })

  useEffect(() => {
    if (!name_id) return
    if (currentAccountStatus === 'loading') return
    if (!accounts[name_id]) fetchAccount(name_id)
  }, [name_id, currentAccountStatus, fetchAccount, accounts])

  const { tabs, activeTab, changeTab } = useTabs<FollowsTabKey>({
    tabs: FOLLOWS_TABS,
    defaultTab: initialTab,
  })

  // タブ切り替えに合わせてパスも差し替える
  const handleTabChange = useCallback(
    (key: FollowsTabKey) => {
      if (key === activeTab) return
      changeTab(key)
      window.history.pushState(null, '', `/@${name_id}/${key}`)
    },
    [activeTab, changeTab, name_id],
  )

  // タブごとの一覧。undefined = 未取得（読み込み中）
  const [lists, setLists] = useState<Partial<Record<FollowsTabKey, AccountType[]>>>({})

  useEffect(() => {
    if (!aid) return
    if (currentAccountStatus === 'loading') return
    if (lists[activeTab]) return

    let cancelled = false
    api
      .post(`/accounts/${aid}/${activeTab}`)
      .then((res) => {
        if (cancelled) return
        setLists((prev) => ({ ...prev, [activeTab]: (res.data?.accounts ?? []) as AccountType[] }))
      })
      .catch(() => {
        if (cancelled) return
        addToast({ message: 'アカウントの取得に失敗しました' })
        setLists((prev) => ({ ...prev, [activeTab]: [] }))
      })
    return () => {
      cancelled = true
    }
  }, [aid, activeTab, currentAccountStatus, lists, addToast])

  return (
    <>
      <MainHeader>{account ? <AccountMainHeader account={account} isOwnAccount={isOwnAccount} onFollow={handleFollow} /> : <div>Account</div>}</MainHeader>

      <div className={styles.container}>
        <div className={styles.tab}>
          <TabBar tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />
        </div>

        <div className={styles.content}>
          <TabContent tabKeys={tabs.map((t) => t.key)} activeTab={activeTab} onTabChange={handleTabChange} className={styles.swipe_area}>
            {(tabKey) => {
              const key = tabKey as FollowsTabKey
              const list = lists[key]
              if (!list) {
                return <div className="p-4 text-center text-[var(--inconspicuous-font-color)]">読み込み中...</div>
              }
              if (list.length === 0) {
                return <div className="p-4 text-center text-[var(--inconspicuous-font-color)]">{EMPTY_MESSAGES[key]}</div>
              }
              return list.map((listedAccount) => <OneLine key={listedAccount.aid} account={listedAccount} classes="p-1 box-content" />)
            }}
          </TabContent>
        </div>
      </div>
    </>
  )
}
