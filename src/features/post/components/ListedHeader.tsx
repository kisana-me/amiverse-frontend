'use client'

import Link from 'next/link'
import styles from '../styles/ListedHeader.module.css'
import { PostType } from '@/types/post'
import { formatRelativeTime } from '@/lib/format_time'

type HeaderProps = {
  post: PostType
  featured?: boolean
}

export default function Header({ post }: HeaderProps) {
  const { account } = post

  return (
    <div className={styles.header}>
      <Link prefetch={false} href={'/@' + account.name_id} className={styles.account_name}>
        {account.name}
      </Link>

      <Link prefetch={false} href={'/@' + account.name_id} className={styles.account_name_id}>
        {'@' + account.name_id}
      </Link>

      <Link prefetch={false} href={'/posts/' + post.aid} className={styles.relative_time}>
        {formatRelativeTime(new Date(post.created_at))}
      </Link>
    </div>
  )
}
