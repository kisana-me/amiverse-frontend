"use client";

import MainHeader from "@/components/main_header/MainHeader";
import TabBar from "@/components/tab_bar/TabBar";
import TabContent from "@/components/tab_content/TabContent";
import { useToast } from "@/providers/ToastProvider";
import { usePosts, CachedPost } from "@/providers/PostsProvider";
import { useFeeds, FeedTypeKey } from "@/providers/FeedsProvider";
import { useCurrentAccount } from "@/providers/CurrentAccountProvider";
import Feed from "@/features/feed/components/Feed";
import { Modal } from "@/components/modal/Modal";
import { useTabs } from "@/hooks/useTabs";
import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PostType } from "@/types/post"
import { FeedItemType } from "@/types/feed"
import { api } from "@/lib/axios";
import Link from "next/link";
import ActionPrompt from "@/components/action_prompt/ActionPrompt";

const HOME_TABS: { key: FeedTypeKey; label: string }[] = [
  { key: 'current', label: '最新' },
  { key: 'following', label: 'フォロー中' },
  { key: 'recommended', label: 'おすすめ' },
];
const FEED_PAGE_SIZE = 30;

// IntersectionObserverを使った無限スクロール用センチネルコンポーネント
function InfiniteScrollSentinel({ onIntersect, isLoading }: { onIntersect: () => void; isLoading: boolean }) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const onIntersectRef = useRef(onIntersect);
  onIntersectRef.current = onIntersect;

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onIntersectRef.current();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={sentinelRef} style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
      {isLoading && (
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          読み込み中...
        </div>
      )}
    </div>
  );
}

function HomeContent() {
  const { addToast } = useToast();
  const { addPosts, getPost } = usePosts();
  const { addFeed, appendFeed, feeds, currentFeedType, setCurrentFeedType } = useFeeds();
  const { currentAccountStatus } = useCurrentAccount();
  const searchParams = useSearchParams();
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);

  const { tabs, activeTab, changeTab, setActiveTab } = useTabs<FeedTypeKey>({
    tabs: HOME_TABS,
    defaultTab: 'current',
    onBeforeChange: (nextTab) => {
      if (nextTab === 'following' && currentAccountStatus !== 'signed_in') {
        setIsSignInModalOpen(true);
        return false;
      }
      return true;
    },
  });

  // タブ変更を FeedsProvider と URL に同期
  useEffect(() => {
    setCurrentFeedType(activeTab);
    // router.replace はサーバーへの RSC リクエストと再レンダーを伴い
    // タブ切替のたびにちらつくため、履歴だけ shallow に書き換える
    const newUrl = activeTab === 'current' ? '/' : `/?tab=${activeTab}`;
    window.history.replaceState(null, '', newUrl);
  }, [activeTab, setCurrentFeedType]);

  // URL クエリパラメータからタブを初期化
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && HOME_TABS.some(t => t.key === tabParam)) {
      setActiveTab(tabParam as FeedTypeKey);
    }
  }, [searchParams, setActiveTab]);

  const [isFeedLoading, setIsFeedLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // キャッシュからタブごとの投稿を導出するヘルパー
  const getPostsForFeed = useCallback((type: FeedTypeKey): CachedPost[] => {
    const feed = feeds[type];
    if (feed && Array.isArray(feed.objects)) {
      return feed.objects.map(item => getPost(item.post_aid)).filter((p): p is CachedPost => !!p);
    }
    return [];
  }, [feeds, getPost]);

  // Reset hasMore when feed type changes
  useEffect(() => {
    setHasMore(true);
  }, [currentFeedType]);

  const fetchPost = useCallback(async () => {
    if (currentAccountStatus === 'loading') return;

    // キャッシュがない場合のみスケルトンローディングを表示
    if (!feeds[currentFeedType]) {
      setIsFeedLoading(true);
    } else {
      setIsRefetching(true);
    }

    try {
      const res = await api.post(`/feeds/${currentFeedType}`)
      if (!res.data) return

      const data = res.data as { posts: PostType[], feed?: FeedItemType[] };

      // Store posts content
      if (data.posts) {
        addPosts(data.posts);
      }

      if (data.feed) {
        addFeed({ type: currentFeedType, objects: data.feed });
        if (data.feed.length < FEED_PAGE_SIZE) {
          setHasMore(false);
        }
      } else if (data.posts) {
        // feedがない場合はpostsの順序でfeedを作成
        const generatedFeed: FeedItemType[] = data.posts.map(post => ({
          type: 'post',
          post_aid: post.aid,
        }));
        addFeed({ type: currentFeedType, objects: generatedFeed });
        if (generatedFeed.length < FEED_PAGE_SIZE) {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }

    } catch (error) {
      addToast({
        message: "タイムライン取得エラー",
        detail: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsFeedLoading(false);
      setIsRefetching(false);
    }
  }, [addPosts, addFeed, addToast, currentFeedType, currentAccountStatus, feeds]);

  const loadMore = async () => {
    const currentPosts = getPostsForFeed(currentFeedType);
    if (isLoadingMore || !hasMore || currentPosts.length === 0) return;
    
    const lastPost = currentPosts[currentPosts.length - 1];
    setIsLoadingMore(true);

    try {
      const cursor = Math.floor(new Date(lastPost.created_at).getTime() / 1000);
      const res = await api.post(`/feeds/${currentFeedType}`, {
        cursor
      });

      if (!res.data) return;

      const data = res.data as { posts: PostType[], feed?: FeedItemType[] };
      const newPosts = data.posts || [];
      const newFeedItems = data.feed || [];

      if (newPosts.length === 0 && newFeedItems.length === 0) {
        setHasMore(false);
        return;
      }

      if (newPosts.length > 0) {
        addPosts(newPosts);
      }

      if (newFeedItems.length > 0) {
        appendFeed({ type: currentFeedType, objects: newFeedItems });
        if (newFeedItems.length < FEED_PAGE_SIZE) {
          setHasMore(false);
        }
      } else if (newPosts.length > 0) {
        const generatedFeed: FeedItemType[] = newPosts.map(post => ({
          type: 'post',
          post_aid: post.aid,
        }));
        appendFeed({ type: currentFeedType, objects: generatedFeed });
        if (generatedFeed.length < FEED_PAGE_SIZE) {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      addToast({
        message: "読み込みエラー",
        detail: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(()=>{
    if (currentAccountStatus === 'loading') return;

    if (!feeds[currentFeedType]) {
      fetchPost();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFeedType, currentAccountStatus])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', position: 'relative' }}>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 80 }}>
        <MainHeader>
          <TabBar tabs={tabs} activeTab={activeTab} onTabChange={changeTab} />
        </MainHeader>
      </div>

      <TabContent
        tabKeys={tabs.map(t => t.key)}
        activeTab={activeTab}
        onTabChange={changeTab}
      >
        {(tabKey) => {
          const feedType = tabKey as FeedTypeKey;
          const feed = feeds[feedType];
          const tabPosts = getPostsForFeed(feedType);
          const isThisTabLoading = feedType === currentFeedType && isFeedLoading && !feed;
          const isThisTabRefetching = feedType === currentFeedType && isRefetching;

          return (
            <div style={{ paddingTop: '50px', paddingBottom: '70px', minHeight: '100%' }}>
              <div style={{ padding: '0.5rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#888', borderBottom: '1px solid var(--border-color)' }}>
                <div>
                  {feed?.fetched_at ? `最終更新: ${new Date(feed.fetched_at).toLocaleString()}` : '未取得'}
                </div>
                <button onClick={fetchPost} disabled={isThisTabRefetching || isThisTabLoading} style={{ cursor: 'pointer', background: 'none', border: '1px solid currentColor', borderRadius: '4px', padding: '2px 8px', color: 'inherit', opacity: (isThisTabRefetching || isThisTabLoading) ? 0.5 : 1 }}>
                  {isThisTabRefetching ? '更新中...' : '再読み込み'}
                </button>
              </div>

              <Feed posts={tabPosts} feed={feed ? { ...feed, type: feedType, fetched_at: feed.fetched_at?.toString() } : undefined} is_loading={isThisTabLoading} />

              {feedType !== 'recommended' && tabPosts.length > 0 && !isThisTabLoading && (
                <>
                  {feedType === currentFeedType && hasMore ? (
                    <InfiniteScrollSentinel onIntersect={loadMore} isLoading={isLoadingMore} />
                  ) : feedType === currentFeedType ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      すべてを読み込みました
                    </div>
                  ) : null}
                </>
              )}
            </div>
          );
        }}
      </TabContent>

      <Modal isOpen={isSignInModalOpen} onClose={() => setIsSignInModalOpen(false)} title="サインインが必要です">
        <div style={{ padding: '1rem' }}>
          <p>フォロー中の投稿を見るにはサインインが必要です。</p>
          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button onClick={() => setIsSignInModalOpen(false)} style={{ padding: '0.5rem 1rem', border: 'none', background: 'none', cursor: 'pointer' }}>
              キャンセル
            </button>
            <Link prefetch={false} href="/signin" style={{ padding: '0.5rem 1rem', background: '#747eee', color: 'white', borderRadius: '4px', textDecoration: 'none' }}>
              サインイン
            </Link>
          </div>
        </div>
      </Modal>

      <ActionPrompt />
    </div>
  );
}

export default function HomeClient() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}
