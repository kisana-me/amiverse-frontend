"use client";

import MainHeader from "@/app/components/main_header/MainHeader";
import { useToast } from "@/app/providers/ToastProvider";
import { usePosts, CachedPost } from "@/app/providers/PostsProvider";
import { useFeeds, FeedTypeKey } from "@/app/providers/FeedsProvider";
import { useCurrentAccount } from "@/app/providers/CurrentAccountProvider";
import Feed from "@/app/components/feed/feed";
import { Modal } from "@/app/components/modal/Modal";
import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PostType } from "@/types/post"
import { FeedItemType } from "@/types/feed"
import { api } from "@/app/lib/axios";
import Link from "next/link";

// Valid tab values for URL query parameter
const VALID_TABS: FeedTypeKey[] = ['index', 'follow', 'current'];

function HomeContent() {
  const { addToast } = useToast();
  const { addPosts, getPost } = usePosts();
  const { addFeed, appendFeed, feeds, currentFeedType, setCurrentFeedType } = useFeeds();
  const { currentAccountStatus } = useCurrentAccount();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Initialize feed type from URL query parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && VALID_TABS.includes(tabParam as FeedTypeKey)) {
      setCurrentFeedType(tabParam as FeedTypeKey);
    }
  }, [searchParams, setCurrentFeedType]);

  const [posts, setPosts] = useState<PostType[]>(() => {
    const cachedFeed = feeds[currentFeedType];
    if (cachedFeed && Array.isArray(cachedFeed.objects)) {
      return cachedFeed.objects.map(item => getPost(item.post_aid)).filter((p): p is CachedPost => !!p);
    }
    return [];
  });
  const [isFeedLoading, setIsFeedLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const cachedFeed = feeds[currentFeedType];
  const fetchedAt = cachedFeed?.fetched_at;

  // キャッシュまたは投稿データが更新されたら表示を更新
  useEffect(() => {
    if (cachedFeed && Array.isArray(cachedFeed.objects)) {
      const cachedPosts = cachedFeed.objects.map(item => getPost(item.post_aid)).filter((p): p is CachedPost => !!p);
      setPosts(cachedPosts);
    } else {
      setPosts([]);
    }
  }, [cachedFeed, getPost]);

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
      } else if (data.posts) {
        // feedがない場合はpostsの順序でfeedを作成
        const generatedFeed: FeedItemType[] = data.posts.map(post => ({
          type: 'post',
          post_aid: post.aid,
        }));
        addFeed({ type: currentFeedType, objects: generatedFeed });
      }

    } catch (error) {
      addToast({
        title: "タイムライン取得エラー",
        message: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsFeedLoading(false);
      setIsRefetching(false);
    }
  }, [addPosts, addFeed, addToast, currentFeedType, currentAccountStatus, feeds]);

  const loadMore = async () => {
    if (isLoadingMore || !hasMore || posts.length === 0) return;
    
    const lastPost = posts[posts.length - 1];
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
      } else if (newPosts.length > 0) {
        const generatedFeed: FeedItemType[] = newPosts.map(post => ({
          type: 'post',
          post_aid: post.aid,
        }));
        appendFeed({ type: currentFeedType, objects: generatedFeed });
      } else {
        setHasMore(false);
      }
    } catch (error) {
      addToast({
        title: "読み込みエラー",
        message: error instanceof Error ? error.message : String(error),
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

  const handleTabChange = (type: FeedTypeKey) => {
    if (type === 'follow' && currentAccountStatus !== 'signed_in') {
      setIsSignInModalOpen(true);
      return;
    }
    setCurrentFeedType(type);
    // Update URL with new tab parameter (use 'index' as default, so omit it from URL)
    const newUrl = type === 'index' ? '/' : `/?tab=${type}`;
    router.replace(newUrl);
  };

  const tabStyle = (type: string) => ({
    fontSize: '.8rem',
    fontWeight: currentFeedType === type ? 'bold' : 'normal',
    borderBottom: currentFeedType === type ? '2px solid currentColor' : '2px solid transparent',
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: 'none',
    padding: '0.5rem 1rem',
    background: 'none',
    cursor: 'pointer',
    color: 'inherit',
    opacity: currentFeedType === type ? 1 : 0.7
  });

  return (
    <>
      <MainHeader>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => handleTabChange('index')} style={tabStyle('index')}>
            人気
          </button>
          <button onClick={() => handleTabChange('follow')} style={tabStyle('follow')}>
            フォロー中
          </button>
          <button onClick={() => handleTabChange('current')} style={tabStyle('current')}>
            最新
          </button>
        </div>
      </MainHeader>
      
      <div style={{ padding: '0.5rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#888', borderBottom: '1px solid var(--border-color)' }}>
        <div>
          {fetchedAt ? `最終更新: ${new Date(fetchedAt).toLocaleString()}` : '未取得'}
        </div>
        <button onClick={fetchPost} disabled={isRefetching || isFeedLoading} style={{ cursor: 'pointer', background: 'none', border: '1px solid currentColor', borderRadius: '4px', padding: '2px 8px', color: 'inherit', opacity: (isRefetching || isFeedLoading) ? 0.5 : 1 }}>
          {isRefetching ? '更新中...' : '再読み込み'}
        </button>
      </div>

      <Feed posts={posts} feed={cachedFeed ? { ...cachedFeed, type: currentFeedType, fetched_at: cachedFeed.fetched_at?.toString() } : undefined} is_loading={isFeedLoading} />

      {currentFeedType !== 'index' && hasMore && posts.length > 0 && !isFeedLoading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
          <button 
            onClick={loadMore} 
            disabled={isLoadingMore}
            style={{ 
              padding: '0.5rem 2rem', 
              background: 'var(--bg-secondary)', 
              border: 'none', 
              borderRadius: '20px', 
              cursor: 'pointer',
              color: 'var(--text-secondary)'
            }}
          >
            {isLoadingMore ? '読み込み中...' : 'さらに読み込む'}
          </button>
        </div>
      )}

      <Modal isOpen={isSignInModalOpen} onClose={() => setIsSignInModalOpen(false)} title="サインインが必要です">
        <div style={{ padding: '1rem' }}>
          <p>フォロー中の投稿を見るにはサインインが必要です。</p>
          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button onClick={() => setIsSignInModalOpen(false)} style={{ padding: '0.5rem 1rem', border: 'none', background: 'none', cursor: 'pointer' }}>
              キャンセル
            </button>
            <Link href="/signin" style={{ padding: '0.5rem 1rem', background: '#747eee', color: 'white', borderRadius: '4px', textDecoration: 'none' }}>
              サインイン
            </Link>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}
