'use client'

import Link from 'next/link'
import { PostType } from '@/types/post'
import { formatRelativeTime } from '@/lib/format_time'
import { usePostClick } from '../hooks/usePostClick'
import styles from '../styles/Quote.module.css'

export default function ItemQuote({ post }: { post: PostType }) {
  const { quote } = post

  const postClickHandlers = usePostClick(quote?.aid || '', true)

  if (!quote) return null

  const { account } = quote

  return (
    <div className={styles.quote} {...postClickHandlers}>
      <div className={styles.header}>
        <div className={styles.account}>
          <img src={account.icon_url || '/ast-imgs/icon.png'} alt={account.name} className={styles.icon} />
          <span className={styles.name}>{account.name}</span>
          <span className={styles.name_id}>@{account.name_id}</span>
        </div>
        <div className={styles.date}>{formatRelativeTime(new Date(quote.created_at))}</div>
      </div>
      <div className={styles.content}>{quote.content}</div>
    </div>
  )
}
