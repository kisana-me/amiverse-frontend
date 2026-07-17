"use client";

import MainHeader from "@/components/main_header/MainHeader";
import TabBar from "@/components/tab_bar/TabBar";
import TabContent from "@/components/tab_content/TabContent";
import { useFeeds, FeedTypeKey } from "@/providers/FeedsProvider";
import { useCurrentAccount } from "@/providers/CurrentAccountProvider";
import { Modal } from "@/components/modal/Modal";
import { useTabs } from "@/hooks/useTabs";
import { useFeedTimeline, FeedPage, UseFeedTimelineReturn } from "@/hooks/useFeedTimeline";
import FeedTimeline from "@/features/feed/components/FeedTimeline";
import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/axios";
import Link from "next/link";
import ActionPrompt from "@/components/action_prompt/ActionPrompt";
import PullToRefresh from "@/components/pull_to_refresh/PullToRefresh";
import { SIGNED_IN_HOME_TABS as HOME_TABS } from "./home_tabs";

function HomeContent() {
  const { setCurrentFeedType } = useFeeds();
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

  // フィード種別ごとの取得関数（cursor 未指定なら先頭ページ）
  const fetchFeedPage = useCallback(async (type: FeedTypeKey, cursor?: number): Promise<FeedPage | null> => {
    const res = await api.post(`/feeds/${type}`, cursor ? { cursor } : undefined);
    return (res.data ?? null) as FeedPage | null;
  }, []);

  const fetchCurrent = useCallback((cursor?: number) => fetchFeedPage('current', cursor), [fetchFeedPage]);
  const fetchFollowing = useCallback((cursor?: number) => fetchFeedPage('following', cursor), [fetchFeedPage]);
  const fetchRecommended = useCallback((cursor?: number) => fetchFeedPage('recommended', cursor), [fetchFeedPage]);

  const statusReady = currentAccountStatus !== 'loading';

  const currentTimeline = useFeedTimeline({
    feedKey: 'current',
    fetchPage: fetchCurrent,
    enabled: statusReady && activeTab === 'current',
    errorMessage: 'タイムライン取得エラー',
  });
  const followingTimeline = useFeedTimeline({
    feedKey: 'following',
    fetchPage: fetchFollowing,
    enabled: statusReady && activeTab === 'following',
    errorMessage: 'タイムライン取得エラー',
  });
  const recommendedTimeline = useFeedTimeline({
    feedKey: 'recommended',
    fetchPage: fetchRecommended,
    enabled: statusReady && activeTab === 'recommended',
    errorMessage: 'タイムライン取得エラー',
  });

  const timelines: Record<FeedTypeKey, UseFeedTimelineReturn> = {
    current: currentTimeline,
    following: followingTimeline,
    recommended: recommendedTimeline,
  };
  const activeTimeline = timelines[activeTab];

  // タブバーのクリック。アクティブなタブをもう一度クリックしたとき、
  // 最上部なら再読み込み（PC向けの更新操作）、スクロール中なら最上部へスムーズスクロール
  const handleTabSelect = useCallback((key: FeedTypeKey) => {
    if (key === activeTab) {
      if (window.scrollY > 0) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (!activeTimeline.isRefetching && !activeTimeline.isLoading) activeTimeline.refresh();
      return;
    }
    changeTab(key);
  }, [activeTab, activeTimeline, changeTab]);

  return (
    <>
      <MainHeader>
        <TabBar tabs={tabs} activeTab={activeTab} onTabChange={handleTabSelect} />
      </MainHeader>

      <PullToRefresh onRefresh={activeTimeline.refresh} refreshing={activeTimeline.isRefetching} disabled={activeTimeline.isLoading}>
        <TabContent
          tabKeys={tabs.map(t => t.key)}
          activeTab={activeTab}
          onTabChange={changeTab}
        >
          {(tabKey) => {
            const feedType = tabKey as FeedTypeKey;
            return (
              <FeedTimeline
                timeline={timelines[feedType]}
                feedType={feedType}
                isActive={feedType === activeTab}
                infiniteScroll={feedType !== 'recommended'}
              />
            );
          }}
        </TabContent>
      </PullToRefresh>

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
    </>
  );
}

export default function HomeClient() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}
