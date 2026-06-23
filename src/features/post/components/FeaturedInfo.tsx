'use client'

import Link from 'next/link'
import { PostType } from '@/types/post'
import styles from '../styles/FeaturedInfo.module.css'

export default function FeaturedInfo({ post }: { post: PostType }) {
  return (
    <div className={styles.info}>
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
  )
}
