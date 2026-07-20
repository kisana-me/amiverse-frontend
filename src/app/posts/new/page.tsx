'use client'

import { Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import MainHeader from '@/components/main_header/MainHeader'
import SkeletonItem from '@/components/post/skeleton_item'
import PostForm from '@/features/form/components/PostForm'
import Post from '@/features/post/components/ListedPost'
import Quote from '@/features/post/components/Quote'
import { api } from '@/lib/axios'
import { useCurrentAccount } from '@/providers/CurrentAccountProvider'
import { usePosts } from '@/providers/PostsProvider'
import { useToast } from '@/providers/ToastProvider'
import { PostType } from '@/types/post'
import styles from './page.module.css'

export default function Page() {
  return (
    <Suspense fallback={null}>
      <PageContent />
    </Suspense>
  )
}

function PageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const reply = searchParams.get('reply') || undefined
  const quote = searchParams.get('quote') || undefined
  const community = searchParams.get('community') || undefined
  const { currentAccountStatus } = useCurrentAccount()
  const { posts, addPosts } = usePosts()
  const { addToast } = useToast()

  const targetAid = reply || quote
  const target = targetAid ? posts[targetAid] : undefined
  const [targetLoading, setTargetLoading] = useState<boolean>(() => !!targetAid && !target)
  const [scrollAdjusted, setScrollAdjusted] = useState(false)
  const targetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (currentAccountStatus === 'signed_out') {
      addToast({ message: 'エラー', detail: 'サインインが必要です' })
      router.push('/')
    }
  }, [currentAccountStatus, router, addToast])

  const fetchTarget = useCallback(() => {
    if (!targetAid || currentAccountStatus === 'loading') return
    api
      .post('/posts/' + targetAid)
      .then((res) => {
        addPosts([res.data])
      })
      .catch(() => {
        addToast({ message: '投稿の取得に失敗しました' })
      })
      .finally(() => {
        setTargetLoading(false)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetAid, currentAccountStatus])

  useEffect(() => {
    if (!targetAid) return
    setScrollAdjusted(false)
    if (target) {
      setTargetLoading(false)
      return
    }
    setTargetLoading(true)
    fetchTarget()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetAid, fetchTarget])

  useLayoutEffect(() => {
    if (!scrollAdjusted && targetRef.current) {
      if (window.scrollY > 0) {
        setScrollAdjusted(true)
        return
      }
      window.scrollTo(0, window.scrollY + targetRef.current.offsetHeight)
      setScrollAdjusted(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target])

  const handleSuccess = () => {
    if (community) {
      router.push(`/communities/${community}`)
    } else if (reply) {
      router.push(`/posts/${reply}`)
    } else {
      router.push('/?tab=current')
    }
  }

  if (currentAccountStatus !== 'signed_in') {
    return null
  }

  const title = reply ? '返信' : quote ? '引用' : '新規作成'

  return (
    <>
      <MainHeader>{title}</MainHeader>
      {targetAid &&
        (targetLoading ? (
          <SkeletonItem />
        ) : (
          target && (
            <div ref={targetRef} className={styles.target}>
              {reply ? (
                <Post post={target} />
              ) : (
                <div className={styles.quote_wrap}>
                  <Quote post={{ quote: target } as unknown as PostType} />
                </div>
              )}
            </div>
          )
        ))}
      {(!targetAid || (!targetLoading && target)) && (
        <div className={styles.form_area}>
          <PostForm replyPost={reply ? target : undefined} quotePost={quote ? target : undefined} communityAid={community} onSuccess={handleSuccess} placeholder={reply ? '返信を投稿' : undefined} />
        </div>
      )}
    </>
  )
}
