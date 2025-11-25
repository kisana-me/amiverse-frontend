"use client";

import Link from 'next/link'

import { PostType } from "@/types/post"
import { FeedType, FeedItemType } from "@/types/feed"

import Post from "@/app/components/post/post"
import SkeletonItem from "@/app/components/post/skeleton_item"
import { formatRelativeTime } from "@/app/lib/format_time"

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
        const post = posts.find((p) => p.aid === item.post_aid);
        return post ? { post, feedItem: item } : undefined;
      }).filter((item): item is { post: PostType, feedItem: FeedItemType } => item !== undefined);
    }
    return posts.map(post => ({ post, feedItem: undefined }));
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
                {displayPosts.map(({ post, feedItem }, index) => (
                  <div key={`${post.aid}-${index}`}>
                    {feedItem?.type === 'diffuse' && feedItem.account && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px 0', fontSize: '0.9rem', color: '#666' }}>
                        <img 
                          src={feedItem.account.icon_url || "/ast-imgs/icon.png"} 
                          alt=""
                          style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} 
                        />
                        <span style={{ fontWeight: 'bold', marginLeft: '4px' }}>
                          <Link href={`/@${feedItem.account.name_id}`}>
                            {feedItem.account.name}
                          </Link>
                        </span>
                        <span style={{ marginLeft: '4px', opacity: 0.8 }}>@{feedItem.account.name_id}</span>
                        <span style={{ marginLeft: '4px', opacity: 0.8 }}>{feedItem.created_at && formatRelativeTime(new Date(feedItem.created_at))}</span>
                        <span style={{ marginLeft: 'auto', fontSize: '0.8em' }}>拡散</span>
                      </div>
                    )}
                    <Post {...post} />
                  </div>
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
