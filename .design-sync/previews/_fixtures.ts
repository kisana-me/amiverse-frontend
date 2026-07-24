// Shared sample data for the preview cards. Not a preview itself (no .tsx
// extension → the converter never treats it as a component preview).
//
// Images are inline SVG data URIs so cards render identically offline.
import type { AccountType } from '@/types/account'
import type { PostType } from '@/types/post'

const svg = (body: string, w = 96, h = 96) =>
  'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${body}</svg>`)

export const avatar = svg('<rect width="96" height="96" fill="#46be1b"/><circle cx="48" cy="38" r="18" fill="#fff"/><path d="M12 96c6-22 20-30 36-30s30 8 36 30z" fill="#fff"/>')
export const avatarAlt = svg('<rect width="96" height="96" fill="#1b8bbe"/><circle cx="48" cy="38" r="18" fill="#fff"/><path d="M12 96c6-22 20-30 36-30s30 8 36 30z" fill="#fff"/>')
export const banner = svg('<defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#46be1b"/><stop offset="1" stop-color="#1b8bbe"/></linearGradient></defs><rect width="600" height="200" fill="url(#g)"/>', 600, 200)
export const artwork = svg('<rect width="400" height="300" fill="#101820"/><circle cx="140" cy="110" r="52" fill="#6ef744"/><rect x="200" y="150" width="150" height="110" rx="12" fill="#f4a21b"/>', 400, 300)
export const photo = svg('<rect width="400" height="300" fill="#2b2f3a"/><path d="M0 240l110-90 80 62 70-52 140 110z" fill="#7d8698"/><circle cx="310" cy="70" r="34" fill="#ffd66b"/>', 400, 300)

export const account: AccountType = {
  aid: 'acc-0001',
  name: '綾瀬 みなも',
  name_id: 'minamo',
  icon_url: avatar,
  banner_url: banner,
  description: '風景と生きものの絵を描いています。作業配信はだいたい週末の夜。お仕事のご相談は DM か https://example.com/minamo からどうぞ。',
  created_at: '2024-04-02T09:00:00Z',
  followers_count: 1284,
  following_count: 312,
  posts_count: 968,
  is_following: false,
  ring_color: '#46be1b',
  status_rb_color: '#6ef744',
  badges: [{ name: 'アーティスト', url: avatar }],
}

export const otherAccount: AccountType = {
  aid: 'acc-0002',
  name: '佐倉 ひなた',
  name_id: 'hinata',
  icon_url: avatarAlt,
  description: 'ドット絵と音楽。',
  followers_count: 208,
  following_count: 190,
  posts_count: 412,
  is_following: true,
}

export const post: PostType = {
  aid: 'post-0001',
  content: '夕方の川辺をスケッチしてきました。光の入り方が思ったより難しくて、結局 3 回描き直しています。\n次は夜の水面に挑戦したい。 #スケッチ @hinata https://example.com/gallery/river-sketch',
  visibility: 'opened',
  rating: 'general',
  created_at: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
  reply_presence: false,
  quote_presence: false,
  replies_count: 4,
  quotes_count: 2,
  diffuses_count: 18,
  reactions_count: 37,
  views_count: 1520,
  is_diffused: false,
  is_reacted: true,
  reactions: [
    { name: '👍', name_id: 'thumbs_up', reactions_count: 21, reacted: true },
    { name: '✨', name_id: 'sparkles', reactions_count: 12, reacted: false },
    { name: '🎨', name_id: 'artist_palette', reactions_count: 4, reacted: false },
  ],
  account,
}

export const postWithMedia: PostType = {
  ...post,
  aid: 'post-0002',
  content: '写真も一緒に。',
  reactions_count: 8,
  reactions: [{ name: '👍', name_id: 'thumbs_up', reactions_count: 8, reacted: false }],
  media: [
    { type: 'image', aid: 'media-1', name: 'river.png', description: '夕方の川辺', url: photo, rating: 'general' },
    { type: 'image', aid: 'media-2', name: 'sketch.png', description: 'ラフ', url: artwork, rating: 'general' },
  ],
}

export const postWithDrawings: PostType = {
  ...post,
  aid: 'post-0003',
  content: 'お絵かき機能で描きました。',
  drawings: [{ aid: 'draw-1', name: '川辺のラフ', description: '10 分ドローイング', image_url: artwork, rating: 'general', created_at: post.created_at }],
}

export const quotePost: PostType = {
  ...post,
  aid: 'post-0004',
  content: 'これ、めちゃくちゃ良い……',
  quote_presence: true,
  account: otherAccount,
  quote: post,
}

export const replyPost: PostType = {
  ...post,
  aid: 'post-0005',
  content: 'ありがとうございます！次は夜景を描きます。',
  reply_presence: true,
  account: otherAccount,
  reply: post,
}

export const sensitivePost: PostType = {
  ...post,
  aid: 'post-0006',
  content: 'センシティブ設定のテスト投稿。',
  rating: 'nsfw',
}
