'use client'

import styles from './styles.module.css'
import Link from 'next/link'
import MainHeader from '@/components/main_header/MainHeader'
import { useCurrentAccount } from '@/providers/CurrentAccountProvider'

export default function Page() {
  const { currentAccount, currentAccountStatus } = useCurrentAccount()
  const balance = currentAccount?.coin_balance ?? 0

  return (
    <>
      <MainHeader>コイン</MainHeader>
      <div className={styles.page}>
        <div className={styles.balance_card}>
          <span className={styles.balance_label}>現在の残高</span>
          <span className={styles.balance_value}>
            <span className={styles.coin_icon}>🪙</span>
            {currentAccountStatus === 'loading' ? '—' : balance.toLocaleString()}
            <span className={styles.unit}>AMV</span>
          </span>
          <Link prefetch={false} href="/coin/history" className={styles.history_link}>
            受領・使用履歴を見る
          </Link>
        </div>

        <section className={styles.about}>
          <h2 className={styles.about_title}>AMVとは</h2>
          <p className={styles.about_text}>Amiverse内で使える通貨（コイン）です。毎日はじめてAmiverseを訪れると、ログインボーナスとして自動でコインがたまります。</p>
          <ul className={styles.about_list}>
            <li>1日1回のログインでボーナスがもらえる</li>
            <li>受け取り・使用の履歴はすべて記録される</li>
            <li>使い道はいろいろ</li>
            <li>稼ぎ方もいろいろ</li>
          </ul>
        </section>
      </div>
    </>
  )
}
