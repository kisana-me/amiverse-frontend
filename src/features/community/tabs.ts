export type CommunityTabKey = 'current' | 'drawings' | 'media' | 'recommended'

export const COMMUNITY_TABS: { key: CommunityTabKey; label: string }[] = [
  { key: 'current', label: '新着' },
  { key: 'drawings', label: 'お絵描き' },
  { key: 'media', label: 'メディア' },
  { key: 'recommended', label: 'おすすめ' },
]
