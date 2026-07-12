'use client'

import Link from 'next/link'
import styles from '../styles/Header.module.css'
import { PostType } from '@/types/post'
import { formatRelativeTime } from '@/lib/format_time'
import Account from './Account'

type HeaderProps = {
  post: PostType
  featured?: boolean
}

export default function Header({ post, featured }: HeaderProps) {
  const { account } = post

  const strVisibility = (v: string) =>
    ({
      opened: '全体公開',
      closed: '非公開',
      limited: '限定公開',
      followers_only: 'フォロワー公開',
      direct_only: '直接公開',
    })[v] ?? '公開状態不明'

  return (
    <div className={styles.header}>
      <Link prefetch={false} className={styles.header_left} href={'/@' + account.name_id}>
        <Account {...account} />
      </Link>
      <div className={styles.header_right}>
        <div>{!featured && formatRelativeTime(new Date(post.created_at))}</div>
        <div>{!featured && strVisibility(post.visibility)}</div>
      </div>
    </div>
  )
}
