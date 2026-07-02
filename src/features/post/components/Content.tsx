'use client'

import { PostType } from '@/types/post'
import RichText from '@/components/rich_text/RichText'
import styles from '../styles/Content.module.css'

export default function Content({ post }: { post: PostType }) {
  if (!post.content) return null
  return <RichText content={post.content} className={styles.content} />
}
