'use client'

import MainHeader from '@/components/main_header/MainHeader'
// import Feed from '@/components/feed/feed'
import Post from '@/features/post/components/ListedPost'
import posts from './posts.json'

export default function Page() {
  return (
    <>
      <MainHeader>Posts</MainHeader>
      {posts.map((post) => (
        <Post key={post.aid} {...post} />
      ))}
    </>
  )
}
