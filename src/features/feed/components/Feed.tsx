'use client'

import Link from 'next/link'

import { PostType } from '@/types/post'
import { FeedType, FeedItemType } from '@/types/feed'

import Post from '@/features/post/components/ListedPost'
import SkeletonItem from '@/components/post/skeleton_item'
import { formatRelativeTime } from '@/lib/format_time'

import Diffuse from './Diffuse'

import styles from '../styles/Feed.module.css'

export default function Feed({ posts, feed, is_loading = false }: { posts: PostType[]; feed?: FeedType; is_loading?: boolean }) {
  // feedとpostsからposts配列を組み立て表示する
  // feedが与えられなければpostsをそのまま表示する

  const displayPosts = (() => {
    if (feed && Array.isArray(feed.objects)) {
      return feed.objects
        .map((item) => {
          const post = posts.find((p) => p.aid === item.post_aid)
          return post ? { post, feedItem: item } : undefined
        })
        .filter((item): item is { post: PostType; feedItem: FeedItemType } => item !== undefined)
    }
    return posts.map((post) => ({ post, feedItem: undefined }))
  })()

  if (is_loading) {
    return (
      <div className={styles.feed}>
        {[...Array(20)].map((_, index) => (
          <SkeletonItem key={index} />
        ))}
      </div>
    )
  }

  if (displayPosts.length === 0) {
    return (
      <div className={styles.feed}>
        <div>フィードはありません</div>
      </div>
    )
  }

  return (
    <div className={styles.feed}>
      {displayPosts.map(({ post, feedItem }, index) => (
        <div key={index}>
          <Diffuse diffuse={feedItem} />
          <Post post={post} />
        </div>
      ))}
    </div>
  )
}
