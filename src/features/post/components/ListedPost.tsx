'use client'

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
import ReplyTo from './ReplyTo'

export default function Post({ post }: { post: PostType }) {
  const postClickHandlers = usePostClick(post.aid)

  return (
    <div className={styles.post} {...postClickHandlers}>
      <Header post={post} />
      <ReplyTo post={post} />
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
