import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { cookies } from 'next/headers'
import type { AccountType } from '@/types/account'
import type { PostType } from '@/types/post'
import type { CommunityType } from '@/types/community'
import type { FeedPage } from '@/hooks/useFeedTimeline'

const AUTH_COOKIE = 'amiverse'
const SESSION_COOKIE = '_amiverse'

const GUEST_FEED_REVALIDATE = 60

// SSR はサーバー間通信のため、ブラウザ用の NEXT_PUBLIC_BACK_URL では Next の実行環境から到達できないことがある。サーバー専用の内部URLを優先する。
const backUrl = process.env.INTERNAL_BACK_URL || process.env.NEXT_PUBLIC_BACK_URL

export async function hasAuthCookie(): Promise<boolean> {
  const store = await cookies()
  return store.has(AUTH_COOKIE)
}

function extractSetCookie(res: Response, name: string): string | null {
  const list = typeof res.headers.getSetCookie === 'function' ? res.headers.getSetCookie() : ([res.headers.get('set-cookie')].filter(Boolean) as string[])
  for (const raw of list) {
    const first = raw.split(';')[0]
    if (first.startsWith(`${name}=`)) return first
  }
  return null
}

async function readAuthCookie(): Promise<string | null> {
  const value = (await cookies()).get(AUTH_COOKIE)?.value
  return value ? `${AUTH_COOKIE}=${value}` : null
}

type CsrfContext = { token: string; sessionCookie: string }

// バックエンドの /v1 POST は CSRF トークンを要求する。ブラウザ同様に GET /start でトークンと対のセッション Cookie を取得してから POST する。
async function bootstrapCsrf(authCookie: string | null): Promise<CsrfContext | null> {
  if (!backUrl) return null
  const headers: Record<string, string> = {}
  if (authCookie) headers['Cookie'] = authCookie

  try {
    const res = await fetch(new URL('/v1/start', backUrl).toString(), { method: 'GET', headers, cache: 'no-store' })
    if (!res.ok) return null
    const sessionCookie = extractSetCookie(res, SESSION_COOKIE)
    const data = (await res.json()) as { csrf_token?: string }
    if (!data.csrf_token || !sessionCookie) return null
    return { token: data.csrf_token, sessionCookie }
  } catch {
    return null
  }
}

async function postJson<T>(path: string, csrf: CsrfContext, cookie: string, body?: unknown): Promise<T | null> {
  if (!backUrl) return null
  let url: string
  try {
    url = new URL(`/v1${path}`, backUrl).toString()
  } catch {
    return null
  }
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrf.token,
        Cookie: cookie,
      },
      body: JSON.stringify(body ?? {}),
      cache: 'no-store',
    })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  }
}

const getCsrfContext = cache(async () => bootstrapCsrf(await readAuthCookie()))

type ServerFetchOptions = {
  body?: unknown
  forwardCookie?: boolean
}

export async function serverFetch<T>(path: string, opts: ServerFetchOptions = {}): Promise<T | null> {
  const csrf = await getCsrfContext()
  if (!csrf) return null

  const cookieParts = [csrf.sessionCookie]
  if (opts.forwardCookie) {
    const auth = await readAuthCookie()
    if (auth) cookieParts.push(auth)
  }
  return postJson<T>(path, csrf, cookieParts.join('; '), opts.body)
}

export const getAccountSSR = cache((name_id: string) => serverFetch<AccountType>(`/accounts/@${name_id}`, { forwardCookie: true }))

export const getPostSSR = cache((aid: string) => serverFetch<PostType>(`/posts/${aid}`, { forwardCookie: true }))

export const getCommunitySSR = cache((aid: string) => serverFetch<CommunityType>(`/communities/${aid}`, { forwardCookie: true }))

// ゲストのトップフィードは公開データのため unstable_cache で revalidate 秒キャッシュし、バックエンドへの二重リクエスト（/start + feed）を全ゲストで共有する。cookies() を読まない匿名ブートストラップを使う。
async function fetchGuestFeed(type: 'current' | 'recommended'): Promise<FeedPage | null> {
  const csrf = await bootstrapCsrf(null)
  if (!csrf) return null
  return postJson<FeedPage>(`/feeds/${type}`, csrf, csrf.sessionCookie)
}

export function getGuestFeedSSR(type: 'current' | 'recommended') {
  return unstable_cache(() => fetchGuestFeed(type), ['guest-feed', type], { revalidate: GUEST_FEED_REVALIDATE })()
}
