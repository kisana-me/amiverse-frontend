'use client'

import SkeletonItem from '@/components/post/skeleton_item'
import MainHeader from '@/components/main_header/MainHeader'
import { api } from '@/lib/axios'
import { useRouter } from 'next/navigation'
import { use, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { usePosts } from '@/providers/PostsProvider'
import { useCurrentAccount } from '@/providers/CurrentAccountProvider'
import { useToast } from '@/providers/ToastProvider'
import Post from '@/features/post/components/ListedPost'
import FeaturedPost from '@/features/post/components/FeaturedPost'
import Feed from '@/features/feed/components/Feed'
import styles from './PostDetail.module.css'

type Props = {
  params: Promise<{
    aid: string
  }>
}

export default function PostDetail({ params }: Props) {
  const { aid } = use(params)
  const { posts, addPosts } = usePosts()
  const { currentAccountStatus } = useCurrentAccount()

  const post = posts[aid] || null
  const [postLoading, setPostLoading] = useState<boolean>(() => !post)
  const [scrollAdjusted, setScrollAdjusted] = useState<boolean>(false)
  const replyRef = useRef<HTMLDivElement>(null)
  const { addToast } = useToast()

  const fetchPost = useCallback(() => {
    if (currentAccountStatus === 'loading') return
    api
      .post('/posts/' + aid)
      .then((res) => {
        addPosts([res.data])
        if (res.data.replies) {
          addPosts(res.data.replies)
        }
      })
      .catch(() => {
        addToast({ message: '投稿の取得に失敗しました' })
      })
      .finally(() => {
        setPostLoading(false)
      })
  }, [aid, addPosts, currentAccountStatus])

  useEffect(() => {
    setScrollAdjusted(false)
  }, [aid])

  useEffect(() => {
    if (!aid) return
    if (post) {
      setPostLoading(false)
    } else {
      setPostLoading(true)
    }
    fetchPost()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aid, fetchPost, currentAccountStatus])

  useLayoutEffect(() => {
    if (!scrollAdjusted && replyRef.current) {
      if (window.scrollY > 0) {
        setScrollAdjusted(true)
        return
      }
      const replyHeight = replyRef.current.offsetHeight
      window.scrollTo(0, window.scrollY + replyHeight)
      setScrollAdjusted(true)
    }
    // scrollAdjusted is intentionally checked but not in deps to avoid unnecessary re-runs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post?.reply])

  return (
    <>
      <MainHeader>投稿詳細</MainHeader>
      {postLoading ? (
        <SkeletonItem />
      ) : post ? (
        <>
          {post?.reply ? (
            <div ref={replyRef} style={{ padding: '8px' }}>
              <Post post={post.reply} />
            </div>
          ) : (
            post.reply_presence &&
            'reply' in post && (
              <div ref={replyRef}>
                <div className="text-center p-4 text-[var(--inconspicuous-font-color)]">返信先が見つかりません</div>
              </div>
            )
          )}
          <FeaturedPost post={post} />
          <div className={styles.reply}>返信</div>
          <div style={{ minHeight: '80vh' }}>{post.replies && <Feed posts={post.replies} />}</div>
        </>
      ) : (
        <div className="text-center p-4 text-[var(--inconspicuous-font-color)]">投稿が見つかりません</div>
      )}
    </>
  )
}
