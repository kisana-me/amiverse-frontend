'use client'

import { PostType } from '@/types/post'
import styles from '../styles/FeaturedPost.module.css'

import Header from './Header'
import Content from './Content'
import Drawings from './Drawings'
import Media from './Media'
import YouTube from './YouTube'
import Quote from './Quote'
import Reactions from './Reactions'
import Console from './Console'
import FeaturedInfo from './FeaturedInfo'
import ReplyTo from './ReplyTo'

export default function FeaturedPost({ post }: { post: PostType }) {
  return (
    <div className={styles.post}>
      <Header post={post} featured={true} />
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
      <FeaturedInfo post={post} />
    </div>
  )
}
