import { Metadata } from 'next'
import CommunityContent from './CommunityContent'
import { getCommunitySSR, hasAuthCookie } from '@/lib/server/backend'

type Props = {
  params: Promise<{
    aid: string
  }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { aid } = await params
  const community = await getCommunitySSR(aid)

  if (!community) {
    return {
      title: 'コミュニティ | Amiverse',
    }
  }

  const title = `${community.name} | Amiverse`
  const description = community.description || `${community.name} のコミュニティ`
  const image = community.banner_url || community.icon_url

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: image ? [image] : undefined,
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: image ? [image] : undefined,
    },
  }
}

export default async function Page({ params }: Props) {
  const { aid } = await params
  const initialCommunity = (await hasAuthCookie()) ? null : await getCommunitySSR(aid)
  return <CommunityContent aid={aid} initialCommunity={initialCommunity} key={aid} />
}
