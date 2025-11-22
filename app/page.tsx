"use client";

import MainHeader from "@/app/components/main_header/MainHeader";
import { useToast } from "@/app/providers/ToastProvider";
import { usePosts, CachedPost } from "@/app/providers/PostsProvider";
import { useFeeds } from "@/app/providers/FeedsProvider";
import Feed from "@/app/components/feed/feed";
import { useEffect, useState, useCallback } from "react";
import { PostType } from "@/types/post"
import { api } from "@/app/lib/axios";

export default function Home() {
  const { addToast } = useToast();
  const { addPosts, getPost } = usePosts();
  const { addFeed, getFeed, feeds } = useFeeds();

  const [feed, setFeed] = useState<PostType[]>(() => {
    const cachedFeed = feeds["home"];
    if (cachedFeed) {
      const cachedPosts = cachedFeed.objects.map(item => getPost(item.aid)).filter((p): p is CachedPost => !!p);
      if (cachedPosts.length === cachedFeed.objects.length) {
        return cachedPosts;
      }
    }
    return [];
  });
  const [isFeedLoading, setIsFeedLoading] = useState(false);

  const fetchPost = useCallback(async () => {
    setIsFeedLoading(true);
    try {
      const res = await api.get('/posts')
      if (!res.data) return

      // Store posts content
      if (res.data.posts) {
        addPosts(res.data.posts);
      }

      if (res.data.feed) {
        addFeed(res.data.feed);
        
        // 現feed -> 旧feed
        const postsMap = new Map(res.data.posts.map((p: PostType) => [p.aid, p]));
        const feedAids = res.data.feed.objects.map((p: {aid: string}) => p.aid);
        const feedPosts = feedAids.map((aid: string) => postsMap.get(aid)).filter((p: PostType | undefined): p is PostType => !!p);
        setFeed(feedPosts);
      } else if (res.data.posts) {
        setFeed(res.data.posts);
      }

    } catch (error) {
      addToast({
        title: "タイムライン取得エラー",
        message: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsFeedLoading(false)
    }
  }, [addPosts, addFeed, addToast]);

  useEffect(()=>{
    async function load() {
      const cachedFeed = feeds["home"];
      if (cachedFeed) {
        const cachedPosts = cachedFeed.objects.map(item => getPost(item.aid)).filter((p): p is CachedPost => !!p);
        if (cachedPosts.length === cachedFeed.objects.length) {
          setFeed(cachedPosts);
          setIsFeedLoading(false);
        } else {
          await fetchPost();
        }
      } else {
        await fetchPost();
      }
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
