'use client'

import Link from 'next/link'
import { PostType } from '@/types/post'
import { formatRelativeTime } from '@/lib/format_time'
import './Quote.css'

export default function ItemQuote(post: PostType) {
  const { quote } = post
  if (!quote) return null

  const { account } = quote

  return (
    <div className="item-quote">
      <Link prefetch={false} href={`/posts/${quote.aid}`} className="item-quote-link">
        <div className="item-quote-header">
          <div className="item-quote-account">
            <img src={account.icon_url || '/ast-imgs/icon.png'} alt={account.name} className="item-quote-icon" />
            <span className="item-quote-name">{account.name}</span>
            <span className="item-quote-id">@{account.name_id}</span>
          </div>
          <div className="item-quote-date">{formatRelativeTime(new Date(quote.created_at))}</div>
        </div>
        <div className="item-quote-content">{quote.content}</div>
      </Link>
    </div>
  )
}
