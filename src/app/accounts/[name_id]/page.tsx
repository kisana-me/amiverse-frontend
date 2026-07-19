import { Metadata } from 'next'
import AccountContent from './AccountContent'
import { getAccountSSR, hasAuthCookie } from '@/lib/server/backend'

type Props = {
  params: Promise<{
    name_id: string
  }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name_id } = await params
  const account = await getAccountSSR(name_id)

  if (!account) {
    return {
      title: `@${name_id} | Amiverse`,
    }
  }

  const title = `${account.name} (@${account.name_id}) | Amiverse`
  const description = account.description || `${account.name} さんのプロフィール`
  const image = account.banner_url || account.icon_url

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: image ? [image] : undefined,
      type: 'profile',
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
  const { name_id } = await params
  const initialAccount = (await hasAuthCookie()) ? null : await getAccountSSR(name_id)
  return <AccountContent name_id={name_id} initialAccount={initialAccount} key={name_id} />
}
