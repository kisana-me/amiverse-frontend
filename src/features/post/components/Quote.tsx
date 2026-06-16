'use client'

import Link from 'next/link'
import { PostType } from '@/types/post'
import { formatRelativeTime } from '@/lib/format_time'
import styles from '../styles/Quote.module.css'

export default function ItemQuote(post: PostType) {
  const { quote } = post
  if (!quote) return null

  const { account } = quote

  return (
    <div className={styles.item_quote}>
      <Link prefetch={false} href={`/posts/${quote.aid}`} className={styles.item_quote_link}>
        <div className={styles.item_quote_header}>
          <div className={styles.item_quote_account}>
            <img src={account.icon_url || '/ast-imgs/icon.png'} alt={account.name} className={styles.item_quote_icon} />
            <span className={styles.item_quote_name}>{account.name}</span>
            <span className={styles.item_quote_id}>@{account.name_id}</span>
          </div>
          <div className={styles.item_quote_date}>{formatRelativeTime(new Date(quote.created_at))}</div>
        </div>
        <div className={styles.item_quote_content}>{quote.content}</div>
      </Link>
    </div>
  )
}
