import { Metadata } from 'next'
import PostDetail from './PostDetail'
import { getPostSSR, hasAuthCookie } from '@/lib/server/backend'

type Props = {
  params: Promise<{
    aid: string
  }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { aid } = await params
  const backUrl = process.env.NEXT_PUBLIC_BACK_URL || ''
  const baseUrl = backUrl.endsWith('/') ? backUrl.slice(0, -1) : backUrl
  const ogImageUrl = `${baseUrl}/og/posts/${aid}`

  const post = await getPostSSR(aid)
  const authorName = post?.account?.name
  const title = authorName ? `${authorName}さんの投稿 | Amiverse` : undefined
  const description = post?.content || undefined

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [ogImageUrl],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
  }
}

export default async function Page({ params }: Props) {
  const { aid } = await params
  const initialPost = (await hasAuthCookie()) ? null : await getPostSSR(aid)
  return <PostDetail aid={aid} initialPost={initialPost} />
}
