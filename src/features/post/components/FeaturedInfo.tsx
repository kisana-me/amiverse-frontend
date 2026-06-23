'use client'

import Link from 'next/link'
import { PostType } from '@/types/post'
import { formatFullDate } from '@/lib/format_time'
import styles from '../styles/FeaturedInfo.module.css'

export default function FeaturedInfo({ post }: { post: PostType }) {
  const strVisibility = (v: string) =>
    ({
      opened: '全体公開',
      closed: '非公開',
      limited: '限定公開',
      followers_only: 'フォロワー公開',
      direct_only: '直接公開',
    })[v] ?? '公開状態不明'

  return (
    <div className={styles.info}>
      <div>
        <Link prefetch={false} href={'/posts/' + post.aid + '/quotes'} className={styles.link}>
          <span className={styles.number}>{post.quotes_count || 0}</span> 引用
        </Link>
        <Link prefetch={false} href={'/posts/' + post.aid + '/diffusions'} className={styles.link}>
          <span className={styles.number}>{post.diffuses_count || 0}</span> 拡散
        </Link>
        <Link prefetch={false} href={'/posts/' + post.aid + '/reactions'} className={styles.link}>
          <span className={styles.number}>{post.reactions_count || 0}</span> リアクション
        </Link>
        <div>
          <span className={styles.number}>{post.views_count || 0}</span> 閲覧
        </div>
      </div>
      <div>
        <span>{formatFullDate(new Date(post.created_at))}</span>
        <span>{strVisibility(post.visibility)}</span>
      </div>
    </div>
  )
}
