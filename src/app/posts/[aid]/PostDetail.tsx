'use client'

import Link from 'next/link'
import SkeletonItem from '@/components/post/skeleton_item'
import MainHeader from '@/components/main_header/MainHeader'
import { api } from '@/lib/axios'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { usePosts } from '@/providers/PostsProvider'
import { useCurrentAccount } from '@/providers/CurrentAccountProvider'
import { useToast } from '@/providers/ToastProvider'
import Post from '@/features/post/components/ListedPost'
import FeaturedPost from '@/features/post/components/FeaturedPost'
import PostForm from '@/features/form/components/PostForm'
import Feed from '@/features/feed/components/Feed'
import styles from './PostDetail.module.css'
import { PostType } from '@/types/post'

type Props = {
  aid: string
  initialPost?: PostType | null
}

export default function PostDetail({ aid, initialPost }: Props) {
  const { posts, addPosts } = usePosts()
  const { currentAccountStatus } = useCurrentAccount()

  const post = posts[aid] || initialPost || null
  const cachedReply = post?.reply ? posts[post.reply.aid] : null
  const mergedReply = post?.reply ? (cachedReply ? { ...cachedReply, ...post.reply } : post.reply) : null
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
    if (initialPost && !posts[aid]) {
      addPosts([initialPost])
      if (initialPost.replies) addPosts(initialPost.replies)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aid])

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

  const handleReplySuccess = (newPost: PostType) => {
    const parent = posts[aid]
    if (parent) {
      addPosts([{ ...parent, replies: [...(parent.replies || []), newPost], replies_count: parent.replies_count + 1 }])
    }
  }

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
  }, [mergedReply])

  return (
    <>
      <MainHeader>投稿詳細</MainHeader>
      {postLoading ? (
        <SkeletonItem />
      ) : post ? (
        <>
          {mergedReply ? (
            <div ref={replyRef}>
              <Post post={mergedReply} />
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
          {currentAccountStatus === 'signed_in' ? (
            <div className={styles.reply}>
              <div className="border-[1px] border-[var(--border-color)] rounded-[8px]">
                <PostForm replyPost={post} placeholder="返信を投稿" onSuccess={handleReplySuccess} />
              </div>
            </div>
          ) : (
            <div className={styles.reply}>
              <div className="border-[1px] border-[var(--border-color)] rounded-[8px] p-[8px] text-center text-[var(--inconspicuous-font-color)]">
                <Link prefetch={false} href="/signin" className="text-[var(--link-color)] hover:underline">
                  サインイン
                </Link>
                して返信しよう
              </div>
            </div>
          )}
          <div style={{ minHeight: '80vh' }}>{post.replies && <Feed posts={post.replies} />}</div>
        </>
      ) : (
        <div className="text-center p-4 text-[var(--inconspicuous-font-color)]">投稿が見つかりません</div>
      )}
    </>
  )
}
