"use client";

import MainHeader from "@/app/components/main_header/MainHeader";
import { useToast } from "@/app/providers/ToastProvider";
import Feed from "@/app/components/feed/Feed";
import { useEffect, useState } from "react";
import { PostType } from "@/types/post"
import { api } from "@/app/lib/axios";

export default function Home() {
  const [isFeedLoading, setIsFeedLoading] = useState(false);
  const [feed, setFeed] = useState<PostType[]>([]);
  const { addToast } = useToast();

  const fetchPost = async () => {
    setIsFeedLoading(true);
    try {
      const res = await api.get('/posts')
      if (!res.data) return
      setFeed(res.data.posts);
    } catch (error) {
      addToast({
        title: "タイムライン取得エラー",
        message: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsFeedLoading(false)
    }
  }

  useEffect(()=>{
    async function load() {
      await fetchPost();
    }
    load();
  }, [])

  return (
    <>
      <MainHeader>
        Feed
      </MainHeader>
      <Feed feed={feed} is_loading={isFeedLoading} />
    </>
  );
}
