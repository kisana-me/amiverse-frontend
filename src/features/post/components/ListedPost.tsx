'use client'

import Link from 'next/link'
import { PostType } from '@/types/post'
import { usePostClick } from '../hooks/usePostClick'
import styles from '../styles/ListedPost.module.css'

import Header from './Header'
import Content from './Content'
import Drawings from './Drawings'
import Media from './Media'
import YouTube from './YouTube'
import Quote from './Quote'
import Reactions from './Reactions'
import Console from './Console'

export default function Post({ post }: { post: PostType }) {
  const postClickHandlers = usePostClick(post.aid)

  return (
    <div className={styles.post} {...postClickHandlers}>
      <Header post={post} />
      <div className={styles.post_to}>
        <Link prefetch={false} href={'/posts/' + post.aid}>
          {post.reply_presence && post?.reply && '返信先: @' + post.reply.account.name_id}
          {post.reply_presence && !post?.reply && '返信'}
          {post.quote_presence && post?.quote && '引用元: @' + post.quote.account.name_id}
          {post.quote_presence && !post?.quote && '引用'}
        </Link>
      </div>
      <div style={{ padding: '0 2px' }}>
        <Content post={post} />
        <Drawings post={post} />
        <Media post={post} />
        <YouTube post={post} />
        <Quote post={post} />
      </div>
      <Reactions post={post} />
      <Console post={post} />
    </div>
  )
}
