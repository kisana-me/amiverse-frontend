'use client'

import { ComponentProps } from 'react'
import MainHeader from '@/components/main_header/MainHeader'
// import Post from '@/components/post/post'
import Post from '@/features/post/components/ListedPost'
import posts from './posts.json'

export default function Page() {
  const post = Array.isArray(posts) && posts.length > 0 ? posts[0] : null

  return (
    <>
      <MainHeader>Post</MainHeader>
      {post && <Post {...(post as ComponentProps<typeof Post>)} />}
    </>
  )
}
