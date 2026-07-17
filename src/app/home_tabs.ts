import { FeedTypeKey } from '@/providers/FeedsProvider'

export type HomeTab = { key: FeedTypeKey; label: string }

export const SIGNED_IN_HOME_TABS: HomeTab[] = [
  { key: 'current', label: '最新' },
  { key: 'following', label: 'フォロー中' },
  { key: 'recommended', label: 'おすすめ' },
]

export type GuestTabKey = 'recommended' | 'current'

export const GUEST_HOME_TABS: { key: GuestTabKey; label: string }[] = [
  { key: 'recommended', label: 'おすすめ' },
  { key: 'current', label: '最新' },
]

export function isGuestTab(value: unknown): value is GuestTabKey {
  return value === 'recommended' || value === 'current'
}
