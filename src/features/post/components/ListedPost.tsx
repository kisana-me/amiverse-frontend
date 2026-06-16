'use client'

import Link from 'next/link'
import styles from '../styles/ListedPost.module.css'

import Header from './Header'
import Content from './Content'
import Drawings from './Drawings'
import YouTube from './YouTube'
import Quote from './Quote'
import Reactions from './Reactions'
import Console from './Console'

import { PostType } from '@/types/post'
import Media from './Media'
import { usePostClick } from '../hooks/usePostClick'

type PostProps = PostType & {
  has_thread_line?: boolean
}

export default function Post(post: PostProps) {
  const postClickHandlers = usePostClick(post.aid)

  return (
    <div className={styles.post} {...postClickHandlers}>
      <Header {...post} />
      <div className={styles.post_to}>
        <Link prefetch={false} href={'/posts/' + post.aid}>
          {post.reply_presence && post?.reply && '返信先: @' + post.reply.account.name_id}
          {post.reply_presence && !post?.reply && '返信'}
          {post.quote_presence && post?.quote && '引用元: @' + post.quote.account.name_id}
          {post.quote_presence && !post?.quote && '引用'}
        </Link>
      </div>
      <div style={{ padding: '0 2px' }}>
        <Content content={post.content} />
        <Drawings drawings={post.drawings} />
        <Media {...post} />
        <YouTube {...post} />
        <Quote {...post} />
      </div>
      <Reactions {...post} />
      <Console {...post} />
    </div>
  )
}
