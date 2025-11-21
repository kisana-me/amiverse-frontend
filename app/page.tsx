"use client";

import MainHeader from "@/app/components/main_header/MainHeader";
import { useToast } from "./providers/ToastProvider";
import Feed from "@/app/components/feed/feed";
import { useEffect, useState } from "react";
import { PostType } from "@/types/post"
import { api } from "./lib/axios";

export default function Home() {
  const [isFeedLoading, setIsFeedLoading] = useState(false);
  const [feed, setFeed] = useState<PostType[]>([]);
  const { addToast } = useToast();

  const fetchPost = async () => {
    setIsFeedLoading(true);
    try {
      const res = await api.get('/posts/')
      const data = await res.data;
      if (!data) return
      setFeed(data.posts);
    } catch (e) {
      console.error(e);
      addToast({
        title: "タイムライン取得エラー",
        message: `${e}`,
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
