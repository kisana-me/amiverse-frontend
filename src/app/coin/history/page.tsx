'use client'

import styles from './styles.module.css'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import MainHeader from '@/components/main_header/MainHeader'
import InfiniteScrollSentinel from '@/components/infinite_scroll_sentinel/InfiniteScrollSentinel'
import { api } from '@/lib/axios'
import { useCurrentAccount } from '@/providers/CurrentAccountProvider'
import { formatRelativeTime } from '@/lib/format_time'

type CoinTransaction = {
  aid: string
  amount: number
  balance_after: number
  kind: string
  memo: string | null
  created_at: string
}

const KIND_LABELS: Record<string, string> = {
  login_bonus: 'ログインボーナス',
  grant: '付与',
  admin_grant: '運営付与',
  spend: '使用',
  admin_spend: '運営徴収',
}

export default function Page() {
  const { currentAccountStatus } = useCurrentAccount()
  const [transactions, setTransactions] = useState<CoinTransaction[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const loadingRef = useRef(false)

  const fetchHistory = useCallback(
    async (reset = false) => {
      if (loadingRef.current) return
      if (!reset && !hasMore) return
      loadingRef.current = true
      setIsLoading(true)
      try {
        const res = await api.post('/coins/history', { cursor: reset ? undefined : cursor })
        const data = (res.data?.data ?? []) as CoinTransaction[]
        const nextCursor = (res.headers['x-next-cursor'] as string | undefined) ?? null
        setTransactions((prev) => (reset ? data : [...prev, ...data]))
        setCursor(nextCursor)
        setHasMore(data.length > 0 && !!nextCursor)
      } catch {
        setHasMore(false)
      } finally {
        loadingRef.current = false
        setIsLoading(false)
      }
    },
    [cursor, hasMore],
  )

  useEffect(() => {
    if (currentAccountStatus !== 'signed_in') return
    fetchHistory(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAccountStatus])

  return (
    <>
      <MainHeader>コイン履歴</MainHeader>
      <div className={styles.page}>
        <Link prefetch={false} href="/coin" className={styles.back}>
          ← コインへ戻る
        </Link>

        {transactions.length > 0 && (
          <div className={styles.list}>
            {transactions.map((tx) => (
              <div key={tx.aid} className={styles.item}>
                <div className={styles.item_main}>
                  <span className={styles.kind}>{KIND_LABELS[tx.kind] ?? tx.kind}</span>
                  {tx.memo && <span className={styles.memo}>{tx.memo}</span>}
                  <span className={styles.time}>{formatRelativeTime(new Date(tx.created_at))}</span>
                </div>
                <div className={styles.item_amount}>
                  <span className={tx.amount >= 0 ? styles.plus : styles.minus}>
                    {tx.amount >= 0 ? '+' : ''}
                    {tx.amount.toLocaleString()}
                  </span>
                  <span className={styles.balance}>残高 {tx.balance_after.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && transactions.length === 0 && <div className={styles.empty}>まだ履歴はありません</div>}

        {transactions.length > 0 && (hasMore ? <InfiniteScrollSentinel onIntersect={() => fetchHistory()} isLoading={isLoading} /> : <div className={styles.no_more}>これ以上履歴はありません</div>)}
      </div>
    </>
  )
}
