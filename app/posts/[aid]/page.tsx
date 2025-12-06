"use client";

import Post from "@/app/components/post/post";
import Feed from "@/app/components/feed/feed";
import SkeletonItem from "@/app/components/post/skeleton_item";
import MainHeader from "@/app/components/main_header/MainHeader";
import { api } from "@/app/lib/axios";
import { PostType } from "@/types/post";
import { useRouter } from "next/navigation";
import { use, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePosts } from "@/app/providers/PostsProvider";
import { useCurrentAccount } from "@/app/providers/CurrentAccountProvider";

type Props = {
  params: Promise<{
    aid: string;
  }>;
};

export default function Page({ params }: Props) {
  const { aid } = use(params);
  const router = useRouter();
  const { posts, getPost, addPosts } = usePosts();
  const { currentAccountStatus } = useCurrentAccount();

  const post = posts[aid] || null;
  const [postLoading, setPostLoading] = useState<boolean>(() => !post);
  const [scrollAdjusted, setScrollAdjusted] = useState<boolean>(false);
  const replyRef = useRef<HTMLDivElement>(null);

  const fetchPost = useCallback(() => {
    if (currentAccountStatus === "loading") return;
    api.post('/posts/' + aid).then(res => {
      addPosts([res.data]);
      if (res.data.replies) {
        addPosts(res.data.replies);
      }
    }).catch(() => {
      // setPost(null); // post is derived from posts now
    }).finally(() => {
      setPostLoading(false);
    });
  }, [aid, addPosts, currentAccountStatus]);

  useEffect(() => {
    if (!aid) return;
    if (post) {
      setPostLoading(false);
    } else {
      setPostLoading(true);
    }
    setScrollAdjusted(false);
    fetchPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aid, fetchPost, currentAccountStatus]);

  useLayoutEffect(() => {
    if (!scrollAdjusted && post?.reply && replyRef.current) {
      const replyHeight = replyRef.current.offsetHeight;
      window.scrollTo(0, window.scrollY + replyHeight);
      setScrollAdjusted(true);
    }
    // scrollAdjusted is intentionally checked but not in deps to avoid unnecessary re-runs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post?.reply]);

  return (
    <>
      <MainHeader>投稿詳細</MainHeader>
      {postLoading ? <SkeletonItem /> :
        post ? (
          <>
            {post?.reply && (
              <div ref={replyRef}>
                <Post {...post.reply} />
                <h2>👆返信先</h2>
              </div>
            )}
            <Post {...post} />
            <div className="flex flex-row gap-4 p-2" style={{ borderBottom: "1px var(--border-color) solid", color: 'var(--inconspicuous-font-color)' }}>
              <Link href={'/posts/' + post.aid + '/quotes'} className="cursor-pointer">
                引用数: {post.quote_count || 0}
              </Link>
              <div>
                拡散数: {post.diffuses_count || 0}
              </div>
              <div>
                返信数: {post.reply_count || 0}
              </div>
            </div>
            {post.replies && (
              <>
                <h2>返信達👇</h2>
                {post.replies && <Feed posts={post.replies} />}
              </>
            )}
          </>
        ) : <div>投稿が見つかりません</div>
      }
    </>
  );
}
