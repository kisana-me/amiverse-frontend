"use client";

import Post from "@/app/components/post/post";
import Feed from "@/app/components/feed/feed";
import SkeletonItem from "@/app/components/post/skeleton_item";
import MainHeader from "@/app/components/main_header/MainHeader";
import { api } from "@/app/lib/axios";
import { PostType } from "@/types/post";
import { useRouter } from "next/navigation";
import { use, useCallback, useEffect, useState } from "react";
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
    fetchPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aid, fetchPost, currentAccountStatus]);

  return (
    <>
      <MainHeader>投稿詳細</MainHeader>
      {postLoading ? <SkeletonItem /> :
        post ? (
          <>
            {post?.reply && (
              <>
                <Post {...post.reply} />
                <h2>👆返信先</h2>
              </>
            )}
            <Post {...post} />
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
