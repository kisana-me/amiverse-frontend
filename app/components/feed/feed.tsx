"use client";

import { PostType } from "@/types/post"
import Post from "@/app/components/post/post"
import SkeletonItem from "@/app/components/post/skeleton_item"

type FeedType = {
  feed: PostType[];
  is_loading?: boolean;
}

export default function Feed({ feed = [], is_loading = false }: FeedType) {

  return (
    <>
      <div className="feed">
        {(() => {
          if (is_loading) {
            return (
              <>
                {[...Array(20)].map((_, index) => (
                  <SkeletonItem key={index} />
                ))}
              </>
            )
          } else if (feed.length > 0) {
            return (
              <>
                {feed.map(item => (
                  <Post key={item.aid} {...item} />
                ))}
              </>
            )
          } else {
            return (
              <>
                <p>アイテムはありません。</p>
              </>
            )
          }
        })()}
      </div>
    </>
  )
}
