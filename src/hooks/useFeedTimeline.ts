"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePosts, CachedPost } from "@/providers/PostsProvider";
import { useFeeds } from "@/providers/FeedsProvider";
import { useToast } from "@/providers/ToastProvider";
import { PostType } from "@/types/post";
import { FeedItemType } from "@/types/feed";

const DEFAULT_PAGE_SIZE = 30;

export type FeedPage = { posts: PostType[]; feed?: FeedItemType[] };

export type UseFeedTimelineOptions = {
  /** FeedsProvider のキャッシュキー */
  feedKey: string;
  /** 1ページ取得。cursor 未指定なら先頭ページ。res.data が空なら null を返す */
  fetchPage: (cursor?: number) => Promise<FeedPage | null>;
  /** これが true かつキャッシュが無いとき自動で初回フェッチする */
  enabled: boolean;
  /** 1ページの件数。取得数がこれ未満なら hasMore を false にする */
  pageSize?: number;
  /** 取得失敗時のトーストメッセージ */
  errorMessage?: string;
  /** SSR で先読みした1ページ目。指定時は初回フェッチをスキップしこのデータから描画する */
  initialData?: FeedPage | null;
};

export type UseFeedTimelineReturn = {
  posts: CachedPost[];
  feed: { objects: FeedItemType[]; fetched_at: number } | undefined;
  /** キャッシュ無しの初回取得中（スケルトン表示用） */
  isLoading: boolean;
  /** キャッシュ有りの再取得中（Pull-to-Refresh 用） */
  isRefetching: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
};

/**
 * フィード1本分のデータ層フック。
 *
 * 取得 → data.feed もしくは posts からの正規化 → PostsProvider/FeedsProvider への
 * キャッシュ → cursor による loadMore → hasMore 管理までを担う。
 * ホーム画面のタブ・アカウントページのタブなど、フィード表示画面で共通利用する。
 *
 * API の呼び方（エンドポイント・パラメータ）とキャッシュキーは呼び出し側が
 * fetchPage / feedKey で与える。
 */
export function useFeedTimeline({
  feedKey,
  fetchPage,
  enabled,
  pageSize = DEFAULT_PAGE_SIZE,
  errorMessage = "読み込みエラー",
  initialData,
}: UseFeedTimelineOptions): UseFeedTimelineReturn {
  const { addPosts, getPost } = usePosts();
  const { addFeed, appendFeed, feeds } = useFeeds();
  const { addToast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const feed = feeds[feedKey];

  // data.feed があればそれを、無ければ posts から feed を生成する
  const normalizeFeed = useCallback((data: FeedPage): FeedItemType[] => {
    if (data.feed) return data.feed;
    return (data.posts || []).map((post) => ({
      type: "post" as const,
      post_aid: post.aid,
    }));
  }, []);

  // キャッシュ未 seed の間は initialData から導出し、SSR と初回クライアント描画を一致させる（ハイドレーション不整合防止）
  const posts = useMemo((): CachedPost[] => {
    if (feed && Array.isArray(feed.objects)) {
      return feed.objects
        .map((item) => getPost(item.post_aid))
        .filter((p): p is CachedPost => !!p);
    }
    if (initialData) {
      const byAid = new Map((initialData.posts || []).map((p) => [p.aid, p]));
      return normalizeFeed(initialData)
        .map((item) => byAid.get(item.post_aid))
        .filter((p): p is PostType => !!p)
        .map((p) => ({ ...p, fetched_at: 0 }));
    }
    return [];
  }, [feed, getPost, initialData, normalizeFeed]);

  const refresh = useCallback(async () => {
    // キャッシュが無い場合のみスケルトンローディングを表示
    if (!feeds[feedKey]) {
      setIsLoading(true);
    } else {
      setIsRefetching(true);
    }

    try {
      const data = await fetchPage();
      if (!data) return;

      if (data.posts) {
        addPosts(data.posts);
      }

      const objects = normalizeFeed(data);
      addFeed({ type: feedKey, objects });
      setHasMore(objects.length >= pageSize);
    } catch (error) {
      addToast({
        message: errorMessage,
        detail: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsLoading(false);
      setIsRefetching(false);
    }
  }, [feeds, feedKey, fetchPage, addPosts, addFeed, normalizeFeed, pageSize, addToast, errorMessage]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore || posts.length === 0) return;

    const lastPost = posts[posts.length - 1];
    setIsLoadingMore(true);

    try {
      const cursor = Math.floor(new Date(lastPost.created_at).getTime() / 1000);
      const data = await fetchPage(cursor);
      if (!data) return;

      const newPosts = data.posts || [];
      const newFeedItems = data.feed || [];

      if (newPosts.length === 0 && newFeedItems.length === 0) {
        setHasMore(false);
        return;
      }

      if (newPosts.length > 0) {
        addPosts(newPosts);
      }

      const objects = normalizeFeed(data);
      if (objects.length > 0) {
        appendFeed({ type: feedKey, objects });
        if (objects.length < pageSize) {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      addToast({
        message: errorMessage,
        detail: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, posts, fetchPage, addPosts, appendFeed, normalizeFeed, feedKey, pageSize, addToast, errorMessage]);

  // initialData をハイドレーション後に一度だけキャッシュへ seed する
  useEffect(() => {
    if (!initialData) return;
    if (feeds[feedKey]) return;
    if (initialData.posts) addPosts(initialData.posts);
    addFeed({ type: feedKey, objects: normalizeFeed(initialData) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedKey]);

  useEffect(() => {
    if (!enabled) return;
    if (initialData) return;
    if (!feeds[feedKey]) {
      refresh();
    }
    // refresh / feeds を依存に入れると再取得のたびに再発火してしまうため意図的に絞る
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, feedKey]);

  return {
    posts,
    feed,
    isLoading,
    isRefetching,
    isLoadingMore,
    hasMore,
    refresh,
    loadMore,
  };
}
