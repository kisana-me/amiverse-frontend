'use client'

import MainHeader from '@/components/main_header/MainHeader'
import TabContent from '@/components/tab_content/TabContent'
import Account from '@/components/Account/OneLine'
import { api } from '@/lib/axios'
import { AccountType } from '@/types/account'
import { EmojiType } from '@/types/emoji'
import { use, useEffect, useMemo, useRef, useState } from 'react'
import { useCurrentAccount } from '@/providers/CurrentAccountProvider'
import { useToast } from '@/providers/ToastProvider'
import styles from './Reactions.module.css'

type Props = {
  params: Promise<{
    aid: string
  }>
}

type ReactionType = {
  account: AccountType
  emoji: EmojiType
}

export default function Page({ params }: Props) {
  const { aid } = use(params)
  const { currentAccountStatus } = useCurrentAccount()
  const { addToast } = useToast()
  const [reactions, setReactions] = useState<ReactionType[]>([])
  const [emojis, setEmojis] = useState<EmojiType[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  const reactionTabs = useMemo(() => [
    { key: 'all', label: 'すべて' },
    ...emojis.map(emoji => ({
      key: emoji.name_id,
      label: emoji.image_url
        ? <img src={emoji.image_url} alt={emoji.name} style={{ width: 20, height: 20, objectFit: 'contain' as const }} />
        : <span style={{ fontSize: '1.125rem', lineHeight: 1 }}>{emoji.name}</span>,
    })),
  ], [emojis])

  const cancelledRef = useRef(false)

  useEffect(() => {
    if (currentAccountStatus === 'loading') return
    if (cancelledRef.current) return
    cancelledRef.current = true

    api
      .post(`/posts/${aid}/reactions`, {})
      .then((res: { data: { reactions: ReactionType[]; emojis: EmojiType[] } }) => {
        setReactions(res.data.reactions)
        if (res.data.emojis && emojis.length === 0) {
          setEmojis(res.data.emojis)
        }
      })
      .catch(() => {
        addToast({ message: 'リアクションしたアカウントの取得に失敗しました' })
      })
      .finally(() => {
        setLoading(false)
      })
  }, [aid, currentAccountStatus, emojis.length, addToast])

  return (
    <TabContent
      tabs={reactionTabs}
      defaultTab="all"
      className={styles.swipe_area}
      renderHeader={(tabBar) => (
        <>
          <MainHeader>リアクションしたアカウント</MainHeader>
          <div className={styles.tab_bar}>{tabBar}</div>
        </>
      )}
    >
      {(tabKey) => {
        const selectedEmojiNameId = tabKey === 'all' ? null : tabKey

        if (loading) {
          return <div className="p-4 text-center text-[var(--inconspicuous-font-color)]">読み込み中...</div>
        }

        const filtered = reactions.filter((reaction) => {
          if (selectedEmojiNameId) {
            return reaction.emoji.name_id === selectedEmojiNameId
          }
          return true
        })

        if (filtered.length === 0) {
          return <div className="p-4 text-center text-[var(--inconspicuous-font-color)]">リアクションはありません</div>
        }

        return (
          <div>
            {filtered.map((reaction, index) => (
              <Account key={`${reaction.account.aid}-${index}`} account={reaction.account} classes="p-1 box-content">
                <div className="ml-2 mr-2 flex-shrink-0">
                  {reaction.emoji ? (
                    <>
                      {reaction.emoji.image_url ? (
                        <img src={reaction.emoji.image_url} className="w-6 h-6 object-contain" alt={reaction.emoji.name} />
                      ) : (
                        <span className="text-xl leading-none">{reaction.emoji.name}</span>
                      )}
                    </>
                  ) : (
                    '?'
                  )}
                </div>
              </Account>
            ))}
          </div>
        )
      }}
    </TabContent>
  )
}
