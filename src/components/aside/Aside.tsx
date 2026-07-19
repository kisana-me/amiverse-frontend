'use client'

import styles from './styles.module.css'
import Link from 'next/link'
import { useOverlay } from '@/providers/OverlayProvider'
import { useTrends } from '@/providers/TrendsProvider'
import { useCurrentAccount } from '@/providers/CurrentAccountProvider'
import { TrendType } from '@/types/trend'
import SkeletonLoading from '@/components/skeleton_loading/SkeletonLoading'

export default function Aside() {
  const { isAsideMenuOpen } = useOverlay()
  const { trends, trendsLoading } = useTrends()
  const { currentAccount, currentAccountStatus } = useCurrentAccount()

  const trendData = trends.length > 0 ? trends[0] : null
  const topTrends = trendData?.ranking.slice(0, 5) || []

  return (
    <aside className={`${styles.aside} ${isAsideMenuOpen ? styles.show_aside : ''}`}>
      {currentAccountStatus === 'signed_in' && (
        <Link prefetch={false} href="/coin" className={styles.wallet}>
          <span className={styles.wallet_icon}>🪙</span>
          <span className={styles.wallet_label}>コイン残高</span>
          <span className={styles.wallet_balance}>{(currentAccount?.coin_balance ?? 0).toLocaleString()} AMV</span>
        </Link>
      )}

      <div className={styles.trends}>
        <h2>トレンド</h2>
        {trendsLoading ? (
          <>
            <div className={styles.trend_list}>
              {[...Array(5)].map((_, index) => (
                <div className={styles.trend_item} key={index}>
                  <div className={styles.trend_rank}>
                    <SkeletonLoading width="20px" height="18px" padding="4px 0" borderRadius="2px" />
                  </div>
                  <div className={styles.trend_word}>
                    <SkeletonLoading width="100px" height="21px" padding="4px 0" borderRadius="2px" />
                  </div>
                  <div className={styles.trend_count}>
                    <SkeletonLoading width="40px" height="18px" padding="4px 0" borderRadius="2px" />
                  </div>
                </div>
              ))}
            </div>
            <Link prefetch={false} href="/discovery" className={styles.trend_more}>
              もっと見る
            </Link>
          </>
        ) : (
          <>
            <div className={styles.trend_list}>
              {topTrends.map((trend: TrendType['ranking'][number], index: number) => (
                <Link prefetch={false} href={`/search?query=${encodeURIComponent(trend.word)}`} className={styles.trend_item} key={index}>
                  <div className={styles.trend_rank}>{index + 1}位</div>
                  <div className={styles.trend_word}>{trend.word}</div>
                  <div className={styles.trend_count}>{trend.count}件</div>
                </Link>
              ))}
            </div>
            <Link prefetch={false} href="/discovery" className={styles.trend_more}>
              もっと見る
            </Link>
          </>
        )}
      </div>

      <footer className={styles.footer}>
        <Link prefetch={false} href="/terms-of-service">
          利用規約
        </Link>
        <Link prefetch={false} href="/privacy-policy">
          プライバシーポリシー
        </Link>
        <Link prefetch={false} href="/contact">
          お問い合わせ
        </Link>
      </footer>
    </aside>
  )
}
