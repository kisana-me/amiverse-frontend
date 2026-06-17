'use client'

import { ComponentProps } from 'react'
import MainHeader from '@/components/main_header/MainHeader'
// import Post from '@/components/post/post'
import Post from '@/features/post/components/ListedPost'
import FeaturedPost from '@/features/post/components/FeaturedPost'
import post from './post.json'
import posts from '../posts/posts.json'

export default function Page() {
  return (
    <>
      <MainHeader>Post</MainHeader>
      {post && <FeaturedPost {...(post as ComponentProps<typeof FeaturedPost>)} />}
      <div>返信:</div>
      {posts.map((post) => (
        <Post key={post.aid} {...(post as ComponentProps<typeof Post>)} />
      ))}
    </>
  )
}
