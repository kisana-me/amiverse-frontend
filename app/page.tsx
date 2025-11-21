"use client";

import MainHeader from "@/app/components/main_header/MainHeader";
import { useToast } from "./providers/ToastProvider";
import Feed from "@/app/components/feed/feed";
import { useEffect, useState } from "react";
import { PostType } from "@/types/post"

export default function Home() {
  const [isFeedLoading, setIsFeedLoading] = useState(false);
  const [feed, setFeed] = useState<PostType[]>([]);
  const { addToast } = useToast();

  const generateToast = () => {
    addToast({
      title: "Hello",
      message: "This is a toast message!",
      status: "show",
      date: Date.now(),
    });
  };

  const fetchPost = async () => {
    setIsFeedLoading(true);
    try {
      const res = await fetch('/api/feeds')
      const data = await res.json();
      if (!data) return
      setFeed(data.feed);
      console.log(feed)
    } catch (e) {
      console.error(e);
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
      <div className="">
        <button onClick={() => generateToast()}>Click me! Add Toast.</button>
        <div>
          <Feed feed={feed} is_loading={isFeedLoading} />
        </div>
      </div>
    </>
  );
}
