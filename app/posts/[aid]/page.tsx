"use client";

import Post from "@/app/components/post/post";
import SkeletonItem from "@/app/components/post/skeleton_item";
import MainHeader from "@/app/components/main_header/MainHeader";
import { api } from "@/app/lib/axios";
import { PostType } from "@/types/post";
import { useRouter } from "next/navigation";
import { use, useCallback, useEffect, useState } from "react";

type Props = {
  params: Promise<{
    aid: string;
  }>;
};

export default function Page({ params }: Props) {
  const { aid } = use(params);
  const router = useRouter();

  const [postLoading, setPostLoading] = useState<boolean>(true);
  const [post, setPost] = useState<PostType | null>(null);

  const fetchPost = useCallback(() => {
    setPostLoading(true);
    api.get('/posts/' + aid).then(res => {
      setPost(res.data);
    }).catch(() => {
      setPost(null);
    }).finally(() => {
      setPostLoading(false);
    });
  }, [aid]);

  useEffect(() => {
    if (!aid) return;
    fetchPost();
  }, [fetchPost]);

  return (
    <>
      <MainHeader>投稿詳細</MainHeader>
      {postLoading ? <SkeletonItem /> :
        post ? <Post {...post} /> : <div>投稿が見つかりません</div>
      }
    </>
  );
}
