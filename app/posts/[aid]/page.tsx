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
      // addToasts([{ type: 'error', message: '投稿の取得に失敗しました' }]);
    }).finally(() => {
      setPostLoading(false);
    });
  }, [aid, addPosts, currentAccountStatus]);

  useEffect(() => {
    setScrollAdjusted(false);
  }, [aid]);

  useEffect(() => {
    if (!aid) return;
    if (post) {
      setPostLoading(false);
    } else {
      setPostLoading(true);
    }
    fetchPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aid, fetchPost, currentAccountStatus]);

  useLayoutEffect(() => {
    if (!scrollAdjusted && replyRef.current) {
      if (window.scrollY > 0) {
        setScrollAdjusted(true);
        return;
      }
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
            {post?.reply ? (
              <div ref={replyRef}>
                <Post {...post.reply} has_thread_line={true} />
              </div>
            ) : (post.reply_presence && 'reply' in post) && (
              <div ref={replyRef}>
                <div className="text-center p-4 text-[var(--inconspicuous-font-color)]">
                  返信先が見つかりません
                </div>
              </div>
            )}
            <div className="flex flex-row gap-4 p-2" style={{ borderBottom: "1px var(--border-color) solid", color: 'var(--inconspicuous-font-color)' }}>
              <div>
                👇🏻注目の投稿👇🏻
              </div>
            </div>
            <Post {...post} has_thread_line={post.replies_count > 0} />
            <div className="flex flex-row gap-2 p-1 items-center overflow-x-auto" style={{ borderBottom: "1px var(--border-color) solid", color: 'var(--inconspicuous-font-color)' }}>
              <Link href={'/posts/' + post.aid + '/quotes'} className="cursor-pointer hover:bg-[var(--hover-color)] p-1 rounded transition-colors whitespace-nowrap">
                引用数: {post.quotes_count || 0}
              </Link>
              <Link href={'/posts/' + post.aid + '/diffusions'} className="cursor-pointer hover:bg-[var(--hover-color)] p-1 rounded transition-colors whitespace-nowrap">
                拡散数: {post.diffuses_count || 0}
              </Link>
              <div className="p-1 whitespace-nowrap">
                返信数: {post.replies_count || 0}
              </div>
              <Link href={'/posts/' + post.aid + '/reactions'} className="cursor-pointer hover:bg-[var(--hover-color)] p-1 rounded transition-colors whitespace-nowrap">
                リアクション数: {post.reactions_count || 0}
              </Link>
            </div>
            {post.replies && (
              <>
                {post.replies && <Feed posts={post.replies} />}
              </>
            )}
          </>
        )
        :
        <div className="text-center p-4 text-[var(--inconspicuous-font-color)]">
          投稿が見つかりません
        </div>
      }
    </>
  );
}
