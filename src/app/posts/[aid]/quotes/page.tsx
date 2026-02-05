"use client";

import Feed from "@/components/feed/feed";
import MainHeader from "@/components/main_header/MainHeader";
import { api } from "@/lib/axios";
import { PostType } from "@/types/post";
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
  const { addPosts } = usePosts();
    const { currentAccountStatus } = useCurrentAccount();
  const [quotes, setQuotes] = useState<PostType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchQuotes = useCallback(() => {
    if (currentAccountStatus === "loading") return;
    setLoading(true);
    api.post('/posts/' + aid + '/quotes').then((res: any) => {
      const fetchedQuotes = res.data.posts;
      addPosts(fetchedQuotes);
      setQuotes(fetchedQuotes);
    }).catch(() => {
      // Handle error
    }).finally(() => {
      setLoading(false);
    });
  }, [aid, addPosts]);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes, currentAccountStatus]);

  return (
    <>
      <MainHeader>引用一覧</MainHeader>
      <Feed posts={quotes} is_loading={loading} />
    </>
  );
}
