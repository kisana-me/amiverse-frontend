'use client'

import Link from 'next/link'
import { PostType } from '@/types/post'
import styles from '../styles/ReplyTo.module.css'

export default function ReplyTo({ post }: { post: PostType }) {
  return (
    <div className={styles.reply_to}>
      {post.reply_presence && !post?.reply && '返信'}
      {post.reply_presence && post?.reply && (
        <>
          <>返信先: </>
          <Link prefetch={false} href={'/@' + post.reply.account.name_id}>
            {'@' + post.reply.account.name_id}
          </Link>
        </>
      )}
    </div>
  )
}
