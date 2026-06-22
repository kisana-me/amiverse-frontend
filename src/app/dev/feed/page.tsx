'use client'

import { PostType } from '@/types/post'
import { FeedType } from '@/types/feed'
import MainHeader from '@/components/main_header/MainHeader'
import Feed from '@/features/feed/components/Feed'
import feed from './feed.json'
import posts from '../posts/posts.json'

export default function Page() {
  return (
    <>
      <MainHeader>Feed</MainHeader>
      <Feed posts={(posts as unknown as PostType[])} feed={({ type: 'feed', objects: (feed as unknown as FeedType['objects']) } as FeedType)} />
    </>
  )
}
