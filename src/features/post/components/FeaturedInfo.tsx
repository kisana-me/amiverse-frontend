'use client'

import Link from 'next/link'
import { PostType } from '@/types/post'
import styles from '../styles/FeaturedInfo.module.css'

export default function FeaturedInfo({ post }: { post: PostType }) {
  return (
    <div className={styles.info}>
      <Link prefetch={false} href={'/posts/' + post.aid + '/quotes'} className={styles.link}>
        引用数: {post.quotes_count || 0}
      </Link>
      <Link prefetch={false} href={'/posts/' + post.aid + '/diffusions'} className={styles.link}>
        拡散数: {post.diffuses_count || 0}
      </Link>
      <Link prefetch={false} href={'/posts/' + post.aid + '/reactions'} className={styles.link}>
        リアクション数: {post.reactions_count || 0}
      </Link>
      <div>
        閲覧数: {post.views_count || 0}
      </div>
    </div>
  )
}
