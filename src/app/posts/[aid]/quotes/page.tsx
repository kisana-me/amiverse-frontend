'use client'

import MainHeader from '@/components/main_header/MainHeader'
import Feed from '@/features/feed/components/Feed'
import { api } from '@/lib/axios'
import { PostType } from '@/types/post'
import { use, useEffect, useRef, useState } from 'react'
import { useCurrentAccount } from '@/providers/CurrentAccountProvider'
import { usePosts } from '@/providers/PostsProvider'
import { useToast } from '@/providers/ToastProvider'

type Props = {
  params: Promise<{
    aid: string
  }>
}

export default function Page({ params }: Props) {
  const { aid } = use(params)
  const { currentAccountStatus } = useCurrentAccount()
  const { addPosts } = usePosts()
  const { addToast } = useToast()
  const [quotes, setQuotes] = useState<PostType[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const cancelledRef = useRef(false)

  useEffect(() => {
    if (currentAccountStatus === 'loading') return
    if (cancelledRef.current) return
    cancelledRef.current = true

    api
      .post(`/posts/${aid}/quotes`)
      .then((res) => {
        const fetchedQuotes: PostType[] = res.data.posts
        addPosts(fetchedQuotes)
        setQuotes(fetchedQuotes)
      })
      .catch(() => {
        addToast({ message: '引用した投稿の取得に失敗しました' })
      })
      .finally(() => {
        setLoading(false)
      })
  }, [aid, currentAccountStatus, addPosts, addToast])

  return (
    <>
      <MainHeader>引用した投稿</MainHeader>
      <Feed posts={quotes} is_loading={loading} />
    </>
  )
}
