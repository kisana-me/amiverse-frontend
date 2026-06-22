'use client'

import { ComponentProps } from 'react'
import MainHeader from '@/components/main_header/MainHeader'
// import Feed from '@/components/feed/feed'
import Post from '@/features/post/components/ListedPost'
import posts from './posts.json'
import { PostType } from '@/types/post'

export default function Page() {
  return (
    <>
      <MainHeader>Posts</MainHeader>
      {posts.map((post) => (
        <Post key={post.aid} post={(post as PostType)} />
      ))}
    </>
  )
}
