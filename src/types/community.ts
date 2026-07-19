import type { AccountType } from '@/types/account'

export type CommunityType = {
  aid: string
  name: string
  description?: string
  icon_url: string
  banner_url?: string
  created_at?: string
  posts_count?: number
  founder?: AccountType | null
}
