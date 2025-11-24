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

type Props = {
  params: Promise<{
    aid: string;
  }>;
};

export default function Page({ params }: Props) {
  const { aid } = use(params);
  const router = useRouter();
  const { getPost, addPosts } = usePosts();

  const [postLoading, setPostLoading] = useState<boolean>(() => !getPost(aid));
  const [post, setPost] = useState<PostType | null>(() => getPost(aid) || null);

  const fetchPost = useCallback(() => {
    api.get('/posts/' + aid).then(res => {
      setPost(res.data);
      addPosts([res.data]);
      if (res.data.replies) {
        addPosts(res.data.replies);
      }
    }).catch(() => {
      setPost(null);
    }).finally(() => {
      setPostLoading(false);
    });
  }, [aid, addPosts]);

  useEffect(() => {
    if (!aid) return;
    const cached = getPost(aid);
    if (cached) {
      setPost(cached);
      setPostLoading(false);
    } else {
      setPostLoading(true);
    }
    fetchPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aid, fetchPost]);

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
