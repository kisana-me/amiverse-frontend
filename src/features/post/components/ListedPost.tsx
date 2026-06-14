'use client'

import { useState } from 'react'
import Link from 'next/link'
import './ListedPost.css'

import Header from './Header'
import Content from './Content'
import Drawings from './Drawings'
import YouTube from './YouTube'
import Quote from './Quote'

import ItemReactions from '@/components/post/item_reactions'
import ItemConsole from '@/components/post/item_console'

import { PostType } from '@/types/post'
import Media from './Media'
import { usePostClick } from '../hooks/usePostClick'

type PostProps = PostType & {
  has_thread_line?: boolean
}

export default function Post(post: PostProps) {
  const postClickHandlers = usePostClick(post.aid)

  return (
    <div className="post" {...postClickHandlers}>
      <Header {...post} />
      <div className="post-reply">
        <Link prefetch={false} href={'/posts/' + post.aid}>
          {post.reply_presence && '返信'}
          {post.quote_presence && (post.reply_presence ? '・引用' : '引用')}
        </Link>
      </div>
      <div style={{ padding: '0 2px' }}>
        <Content content={post.content} />
        <Drawings drawings={post.drawings} />
        <Media {...post} />
        <YouTube {...post} />
        <Quote {...post} />
      </div>
      <ItemReactions {...post} />
      <ItemConsole {...post} />
    </div>
  )
}
