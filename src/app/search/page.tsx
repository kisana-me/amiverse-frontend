"use client";

import "./style.css";
import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import MainHeader from '@/components/main_header/MainHeader';
import { api } from "@/lib/axios";
import { PostType } from "@/types/post";
import Feed from "@/components/feed/feed";
import { useToast } from "@/app/providers/ToastProvider";
import { FeedItemType } from "@/types/feed";

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('query');
  const { addToast } = useToast();

  const [searchInput, setSearchInput] = useState(query || '');
  const [posts, setPosts] = useState<PostType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Update input when URL query changes
  useEffect(() => {
    if (query) {
      setSearchInput(query);
    }
  }, [query]);

  const fetchSearch = useCallback(async () => {
    if (!query) {
        setPosts([]);
        return;
    }

    setIsLoading(true);
    setHasMore(true);
    try {
      const res = await api.post('/search', { query });
      if (res.data) {
        const data = res.data as { posts: PostType[], feed?: FeedItemType[] };
        
        let sortedPosts: PostType[] = [];
        if (data.feed && Array.isArray(data.feed)) {
             sortedPosts = data.feed.map(item => data.posts.find(p => p.aid === item.post_aid)).filter((p): p is PostType => !!p);
        } else {
             sortedPosts = data.posts || [];
        }
        
        setPosts(sortedPosts);
        if (sortedPosts.length === 0) {
            setHasMore(false);
        }
      }
    } catch (error) {
      addToast({
        title: "検索エラー",
        message: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsLoading(false);
    }
  }, [query, addToast]);

  useEffect(() => {
    fetchSearch();
  }, [fetchSearch]);

  const loadMore = async () => {
    if (isLoadingMore || !hasMore || posts.length === 0 || !query) return;
    
    const lastPost = posts[posts.length - 1];
    setIsLoadingMore(true);

    try {
      const cursor = Math.floor(new Date(lastPost.created_at).getTime() / 1000);
      const res = await api.post('/search', {
        query,
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

      let sortedNewPosts: PostType[] = [];
      if (newFeedItems.length > 0) {
          sortedNewPosts = newFeedItems.map(item => newPosts.find(p => p.aid === item.post_aid)).filter((p): p is PostType => !!p);
      } else {
          sortedNewPosts = newPosts;
      }

      if (sortedNewPosts.length > 0) {
        setPosts(prev => [...prev, ...sortedNewPosts]);
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value)
  }

  const handleSearchClick = () => {
    if (searchInput) {
      router.push(`/search?query=${searchInput}`)
    }
  }
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
          handleSearchClick();
      }
  }

  return (
    <>
      <MainHeader>
        <input
          type="search"
          value={searchInput}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          placeholder="検索ワードを入力"
          className="search-input"
        />
        <button onClick={handleSearchClick} className="search-button">
          🔎
        </button>
      </MainHeader>
      
      {query ? (
          <>
            {(isLoading || posts.length > 0) ? (
                <Feed posts={posts} is_loading={isLoading} />
            ) : (
                 <div className="seartch">
                    検索結果はございません
                </div>
            )}
            {hasMore && posts.length > 0 && !isLoading && (
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
          </>
      ) : (
        <div className="seartch">
            検索ワードを入力してください
        </div>
      )}
    </>
  );
}

export default function Page() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  );
}
