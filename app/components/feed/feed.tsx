"use client";

import { PostType } from "@/types/post"
import { FeedType } from "@/types/feed"

import Post from "@/app/components/post/post"
import SkeletonItem from "@/app/components/post/skeleton_item"

export default function Feed({
  posts,
  feed,
  is_loading = false
}: {
  posts: PostType[];
  feed?: FeedType;
  is_loading?: boolean;
}) {
  // feedとpostsからposts配列を組み立て表示する
  // feedが与えられなければpostsをそのまま表示する

  const displayPosts = (() => {
    if (feed && Array.isArray(feed.objects)) {
      return feed.objects.map((item) => {
        return posts.find((p) => p.aid === item.post_aid);
      }).filter((item): item is PostType => item !== undefined);
    }
    return posts;
  })();

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
          } else if (displayPosts.length > 0) {
            return (
              <>
                {displayPosts.map((item, index) => (
                  <Post key={`${item.aid}-${index}`} {...item} />
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
