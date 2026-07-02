export type AccountTabKey = 'posts' | 'replies' | 'media' | 'drawings'

export const ACCOUNT_TABS: { key: AccountTabKey; label: string }[] = [
  { key: 'posts', label: '投稿' },
  { key: 'replies', label: '返信' },
  { key: 'media', label: 'メディア' },
  { key: 'drawings', label: 'お絵描き' },
]
