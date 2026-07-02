'use client'

import Link from 'next/link'
import { AccountType } from '@/types/account'
import { formatDate } from '@/lib/format_time'
import RichText from '@/components/rich_text/RichText'
import styles from '../styles/AccountProfile.module.css'

type Props = {
  account: AccountType
}

export default function AccountProfile({ account }: Props) {
  return (
    <div className={styles.profile}>
      <div className={styles.summary}>
        <RichText content={account.description || ''} />
      </div>
      <div className={styles.keyvalues}>
        {/* 場所の情報は型定義にないため省略 */}
        {account.birthdate && (
          <div className={styles.keyvalue}>
            <div className={styles.key}>🎂誕生日</div>
            <div className={styles.value}>{formatDate(new Date(account.birthdate))}</div>
          </div>
        )}
        {account.created_at && (
          <div className={styles.keyvalue}>
            <div className={styles.key}>🎫参加日</div>
            <div className={styles.value}>{formatDate(new Date(account.created_at))}</div>
          </div>
        )}
      </div>
      <div className={styles.counters}>
        <Link prefetch={false} href={`/@${account.name_id}/followers`} className={styles.counter}>
          <div className={styles.figure}>{account.followers_count ?? 0}</div>
          <div className={styles.subscript}>フォロワー</div>
        </Link>
        <Link prefetch={false} href={`/@${account.name_id}/following`} className={styles.counter}>
          <div className={styles.figure}>{account.following_count ?? 0}</div>
          <div className={styles.subscript}>フォロー</div>
        </Link>
        <div className={styles.counter}>
          <div className={styles.figure}>{account.posts_count ?? 0}</div>
          <div className={styles.subscript}>投稿数</div>
        </div>
      </div>
    </div>
  )
}
