'use client'

import MainHeader from '@/components/main_header/MainHeader'
import Post from '@/features/post/components/ListedPost'
import FeaturedPost from '@/features/post/components/FeaturedPost'
import post from './post.json'
import posts from '../posts/posts.json'
import { PostType } from '@/types/post'

export default function Page() {
  return (
    <>
      <MainHeader>Post</MainHeader>
      {post && <FeaturedPost post={(post as PostType)} />}
      <div>返信:</div>
      {posts.map((post) => (
        <Post key={post.aid} post={(post as PostType)} />
      ))}
    </>
  )
}
