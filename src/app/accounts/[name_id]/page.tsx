"use client";

import MainHeader from "@/components/main_header/MainHeader";
import TabBar from "@/components/tab_bar/TabBar";
import TabContent from "@/components/tab_content/TabContent";
import { api } from "@/lib/axios";
import { Modal } from '@/components/modal/Modal';
import { use, useEffect, useState, useCallback, useRef } from "react";
import SkeletonAccount from "./skeleton_account";
import { formatFullDate } from "@/lib/format_time";
import "./page.css";
import { useToast } from "@/providers/ToastProvider";
import { useCurrentAccount } from "@/providers/CurrentAccountProvider";
import { useAccounts } from "@/providers/AccountsProvider";
import { useTabs } from "@/hooks/useTabs";
import { useFeedTimeline, FeedPage, UseFeedTimelineReturn } from "@/hooks/useFeedTimeline";
import FeedTimeline from "@/features/feed/components/FeedTimeline";
import PullToRefresh from "@/components/pull_to_refresh/PullToRefresh";
import ItemContent from "@/components/post/item_content";

type Props = {
  params: Promise<{
    name_id: string;
  }>;
};

type AccountTabKey = 'posts' | 'replies' | 'media' | 'drawings';

const ACCOUNT_TABS: { key: AccountTabKey; label: string }[] = [
  { key: 'posts', label: '投稿' },
  { key: 'replies', label: '返信' },
  { key: 'media', label: 'メディア' },
  { key: 'drawings', label: 'お絵描き' },
];

// MainHeader (.main-header) の高さ。未訪問タブ切替時の基準スクロール算出に使う
const HEADER_HEIGHT = 50;

export default function Page({ params }: Props) {
  const { name_id } = use(params);
  return <AccountContent name_id={name_id} key={name_id} />;
}

function AccountContent({ name_id }: { name_id: string }) {
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [reportCategory, setReportCategory] = useState('spam')
  const [reportDetail, setReportDetail] = useState('')
  const [isBlockingSubmitting, setIsBlockingSubmitting] = useState(false)
  const [isReportingSubmitting, setIsReportingSubmitting] = useState(false)

  const { accounts, fetchAccount, updateAccount } = useAccounts();

  const [loading, setLoading] = useState<boolean>(!accounts[name_id]);
  const account = accounts[name_id] || null;
  const aid = account?.aid;

  const { addToast } = useToast();
  const { currentAccountStatus, currentAccount } = useCurrentAccount();

  const [isAccountRefreshing, setIsAccountRefreshing] = useState(false);

  useEffect(() => {
    if (!name_id) return;
    if (currentAccountStatus === 'loading') return;

    if (accounts[name_id]) {
      setLoading(false);
    } else {
      setLoading(true);
      fetchAccount(name_id).finally(() => {
        setLoading(false);
      });
    }
  }, [name_id, currentAccountStatus, fetchAccount, accounts]);

  // --- タブ状態 ---
  const { tabs, activeTab, changeTab } = useTabs<AccountTabKey>({
    tabs: ACCOUNT_TABS,
    defaultTab: 'posts',
  });

  // --- タブごとのタイムライン ---
  const fetchAccountPage = useCallback(async (filter: AccountTabKey, cursor?: number): Promise<FeedPage | null> => {
    if (!aid) return null;
    const res = await api.post('/feeds/account', { aid, filter, ...(cursor ? { cursor } : {}) });
    return (res.data ?? null) as FeedPage | null;
  }, [aid]);

  const fetchPosts = useCallback((c?: number) => fetchAccountPage('posts', c), [fetchAccountPage]);
  const fetchReplies = useCallback((c?: number) => fetchAccountPage('replies', c), [fetchAccountPage]);
  const fetchMedia = useCallback((c?: number) => fetchAccountPage('media', c), [fetchAccountPage]);
  const fetchDrawings = useCallback((c?: number) => fetchAccountPage('drawings', c), [fetchAccountPage]);

  const statusReady = currentAccountStatus !== 'loading';
  const makeKey = (k: AccountTabKey) => `${aid ?? 'pending'}:${k}`;

  const postsTimeline = useFeedTimeline({
    feedKey: makeKey('posts'),
    fetchPage: fetchPosts,
    enabled: !!aid && statusReady && activeTab === 'posts',
    errorMessage: '投稿取得エラー',
  });
  const repliesTimeline = useFeedTimeline({
    feedKey: makeKey('replies'),
    fetchPage: fetchReplies,
    enabled: !!aid && statusReady && activeTab === 'replies',
    errorMessage: '投稿取得エラー',
  });
  const mediaTimeline = useFeedTimeline({
    feedKey: makeKey('media'),
    fetchPage: fetchMedia,
    enabled: !!aid && statusReady && activeTab === 'media',
    errorMessage: '投稿取得エラー',
  });
  const drawingsTimeline = useFeedTimeline({
    feedKey: makeKey('drawings'),
    fetchPage: fetchDrawings,
    enabled: !!aid && statusReady && activeTab === 'drawings',
    errorMessage: '投稿取得エラー',
  });

  const timelines: Record<AccountTabKey, UseFeedTimelineReturn> = {
    posts: postsTimeline,
    replies: repliesTimeline,
    media: mediaTimeline,
    drawings: drawingsTimeline,
  };
  const activeTimeline = timelines[activeTab];

  // 未訪問タブに切り替えたときの基準スクロール位置。
  // ページ最上部（バナー）まで戻らず、タブバーがヘッダー直下に来る位置に合わせる。
  const tabBarRef = useRef<HTMLDivElement>(null);
  const getTabBarScrollTop = useCallback(() => {
    const el = tabBarRef.current;
    if (!el) return 0;
    return Math.max(0, el.getBoundingClientRect().top + window.scrollY - HEADER_HEIGHT);
  }, []);

  // Pull-to-Refresh / タブ再クリックでアカウント情報とタイムラインを一緒に更新する
  const handleRefresh = useCallback(async () => {
    setIsAccountRefreshing(true);
    try {
      await Promise.all([
        fetchAccount(name_id, { force: true }),
        activeTimeline.refresh(),
      ]);
    } finally {
      setIsAccountRefreshing(false);
    }
  }, [name_id, fetchAccount, activeTimeline]);

  // アクティブなタブを再クリック: スクロール中なら最上部へ、最上部なら再読み込み
  const handleTabSelect = useCallback((key: AccountTabKey) => {
    if (key === activeTab) {
      if (window.scrollY > 0) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (!isAccountRefreshing && !activeTimeline.isRefetching) handleRefresh();
      return;
    }
    changeTab(key);
  }, [activeTab, isAccountRefreshing, activeTimeline, handleRefresh, changeTab]);

  const handleFollow = async () => {
    if (!account) return;

    const isFollowing = account.is_following;
    const originalFollowersCount = account.followers_count || 0;

    // Optimistic update
    updateAccount(name_id, {
      is_following: !isFollowing,
      followers_count: isFollowing ? originalFollowersCount - 1 : originalFollowersCount + 1,
    });

    try {
      if (isFollowing) {
        await api.delete(`/accounts/${account.aid}/follow`);
      } else {
        await api.post(`/accounts/${account.aid}/follow`);
      }
    } catch {
      // Revert on error
      updateAccount(name_id, {
        is_following: isFollowing,
        followers_count: originalFollowersCount,
      });
      addToast({
        message: "エラー",
        detail: "フォロー操作に失敗しました",
      });
    }
  };

  const handleMenu = () => {
    setIsMenuModalOpen(true);
  };

  const handleBlock = async () => {
    if (!account || currentAccountStatus !== "signed_in" || isBlockingSubmitting) return;

    const isBlocking = !!account.is_blocking;

    updateAccount(name_id, {
      is_blocking: !isBlocking,
    });

    setIsBlockingSubmitting(true);
    try {
      if (isBlocking) {
        await api.delete(`/accounts/${account.aid}/block`);
      } else {
        await api.post(`/accounts/${account.aid}/block`);
      }

      addToast({
        message: isBlocking ? "ブロックを解除しました" : "ブロックしました",
      });
      setIsMenuModalOpen(false);
    } catch (error) {
      updateAccount(name_id, {
        is_blocking: isBlocking,
      });
      addToast({
        message: "エラー",
        detail: error instanceof Error
          ? error.message
          : (isBlocking ? "ブロック解除に失敗しました" : "ブロックに失敗しました"),
      });
    } finally {
      setIsBlockingSubmitting(false);
    }
  };

  const executeReport = async () => {
    if (!account || currentAccountStatus !== "signed_in" || isReportingSubmitting) return;

    setIsReportingSubmitting(true);
    try {
      await api.post("/reports", {
        report: {
          target_type: "account",
          target_aid: account.aid,
          category: reportCategory,
          description: reportDetail,
        }
      });
      addToast({ message: "通報しました" });
      setReportCategory("spam");
      setReportDetail("");
      setIsReportModalOpen(false);
      setIsMenuModalOpen(false);
    } catch (error) {
      addToast({
        message: "通報に失敗しました",
        detail: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsReportingSubmitting(false);
    }
  };

  const handleReport = () => {
    if (!account || currentAccountStatus !== "signed_in") return;
    setIsReportModalOpen(true);
  };

  return (
    <>
      <MainHeader>
        {account ? (
          <div className="account-main-header">
            <div className="amh-icon-wrap" style={{
              borderColor: account.ring_color || '#fff0'
            }}>
              <div className="amh-status" style={{
                bottom: 0,
                right: 0,
                background: account.status_rb_color || '#fff0'
              }}></div>
              <img src={account.icon_url || "/ast-imgs/icon.png"} className="amh-icon" alt="アイコン" />
            </div>
            <div className="amh-nameplate">
              <div className="amh-name">
                {account.name}
              </div>
              <div className="amh-id">
                @{account.name_id}
              </div>
            </div>
            <div className="amh-right">
              <button
                className={`iai-button ${account.is_following ? 'active' : ''}`}
                onClick={handleFollow}
                style={{
                  backgroundColor: account.is_following ? 'var(--bg-secondary)' : 'var(--accent-color)',
                  color: account.is_following ? 'var(--text-primary)' : '#fff',
                }}
              >
                {account.is_following ? 'Following' : 'Follow'}
              </button>
            </div>
          </div>
        ) : (
          <div>Account</div>
        )}
      </MainHeader>

      {loading ? <SkeletonAccount /> :
        account ? (
          <PullToRefresh
            onRefresh={handleRefresh}
            refreshing={isAccountRefreshing || activeTimeline.isRefetching}
            disabled={loading || activeTimeline.isLoading}
          >
          <div className="account-container">
            <div className="account-banner-container">
              <img
                className="account-banner-image"
                src={account.banner_url || "/ast-imgs/banner.png"}
                alt='バナー'
              />
            </div>

            <div className="account-plate">
              <div className="ap-icon-container" style={{
                borderColor: account.ring_color || '#fff0'
              }}>
                <div className="ap-icon-status" style={{
                  background: account.status_rb_color || '#fff0'
                }}></div>
                <img
                  className="ap-icon-image"
                  src={account.icon_url || "/ast-imgs/icon.png"}
                  alt='アイコン'
                />
              </div>

              <div className="ap-nameplate">
                <div className="ap-name">{account.name}</div>
                <div className="ap-id">@{account.name_id}</div>
              </div>

              <div className="ap-buttons">
                <button
                  className={`ap-button ${account.is_following ? 'active' : ''}`}
                  onClick={handleFollow}
                  style={{
                    backgroundColor: account.is_following ? 'var(--bg-secondary)' : 'var(--accent-color)',
                    color: account.is_following ? 'var(--text-primary)' : '#fff',
                  }}
                >
                  {account.is_following ? 'Following' : 'Follow'}
                </button>
                <button
                  className={`ap-button`}
                  onClick={handleMenu}
                  style={{
                    backgroundColor: "var(--bg-secondary)",
                    color: "var(--text-primary)",
                  }}
                >
                  Menu
                </button>
              </div>

              {account.badges && account.badges.length > 0 && (
                <div className="ap-badges">
                  {account.badges.map((badge, index) => (
                    <div className="ap-badge" key={index}>
                      <div className="ap-badge-icon">
                        <img
                          className="ap-badge-icon-image"
                          src={badge.url}
                          alt={badge.name + " badge icon"}
                        />
                      </div>
                      <div className="ap-badge-name">
                        {badge.name}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="account-profile">
              <div className="account-profile-summary">
                <ItemContent content={account.description || ''} />
              </div>
              <div className="account-profile-keyvalues">
                {/* 場所の情報は型定義にないため省略 */}
                {account.birthdate && (
                  <div className="apk-keyvalue">
                    <div className="apk-key">🎂誕生日</div>
                    <div className="apk-value">{formatFullDate(new Date(account.birthdate))}</div>
                  </div>
                )}
                {account.created_at && (
                  <div className="apk-keyvalue">
                    <div className="apk-key">🎫参加日</div>
                    <div className="apk-value">{formatFullDate(new Date(account.created_at))}</div>
                  </div>
                )}
              </div>
              <div className="account-profile-counters">
                <div className="apc-counter">
                  <div className="apc-figure">{account.followers_count ?? 0}</div>
                  <div className="apc-subscript">フォロワー</div>
                </div>
                <div className="apc-counter">
                  <div className="apc-figure">{account.following_count ?? 0}</div>
                  <div className="apc-subscript">フォロー</div>
                </div>
                <div className="apc-counter">
                  <div className="apc-figure">{account.posts_count ?? 0}</div>
                  <div className="apc-subscript">投稿数</div>
                </div>
              </div>
            </div>

            <div className="account-tab" ref={tabBarRef}>
              <TabBar tabs={tabs} activeTab={activeTab} onTabChange={handleTabSelect} />
            </div>

            <div className="account-content">
              <TabContent
                tabKeys={tabs.map(t => t.key)}
                activeTab={activeTab}
                onTabChange={changeTab}
                defaultScrollTop={getTabBarScrollTop}
              >
                {(tabKey) => {
                  const feedType = tabKey as AccountTabKey;
                  return (
                    <FeedTimeline
                      timeline={timelines[feedType]}
                      feedType={makeKey(feedType)}
                      isActive={feedType === activeTab}
                    />
                  );
                }}
              </TabContent>
            </div>
            <Modal
              isOpen={isMenuModalOpen}
              onClose={() => setIsMenuModalOpen(false)}
              title="アカウントメニュー"
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>アカウントのID: {account.aid}</div>

              {currentAccountStatus === "signed_in" && currentAccount?.aid !== account.aid && (
                <>
                  <button
                    onClick={handleBlock}
                    disabled={isBlockingSubmitting}
                    style={{
                      color: 'red',
                      cursor: isBlockingSubmitting ? 'not-allowed' : 'pointer',
                      opacity: isBlockingSubmitting ? 0.7 : 1,
                      padding: '8px',
                      border: '1px solid red',
                      borderRadius: '4px',
                      background: 'transparent'
                    }}
                  >
                    {account.is_blocking ? 'アカウントのブロックを解除' : 'アカウントをブロック'}
                  </button>
                  <button
                    onClick={handleReport}
                    style={{
                      color: 'red',
                      cursor: 'pointer',
                      padding: '8px',
                      border: '1px solid red',
                      borderRadius: '4px',
                      background: 'transparent'
                    }}
                  >
                    アカウントを通報
                  </button>
                </>
              )}
              </div>
            </Modal>

            <Modal
              isOpen={isReportModalOpen}
              onClose={() => setIsReportModalOpen(false)}
              title="アカウントを通報"
            >
              <div className="flex flex-col gap-4 p-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold">通報の理由</label>
                  <select
                    value={reportCategory}
                    onChange={(e) => setReportCategory(e.target.value)}
                    className="p-2 border rounded-md"
                    style={{
                      backgroundColor: 'var(--background-color)',
                      color: 'var(--font-color)',
                      borderColor: 'var(--border-color)',
                    }}
                  >
                    <option value="spam">スパム・迷惑</option>
                    <option value="hate">ヘイト・嫌がらせ・いじめ・差別</option>
                    <option value="disinformation">偽情報・なりすまし</option>
                    <option value="violence">暴力的・テロ・過激的思想</option>
                    <option value="sensitive">センシティブ・性的・残酷</option>
                    <option value="suicide">自殺・自傷</option>
                    <option value="illegal">違法・規制対象・詐欺・不正</option>
                    <option value="theft">盗用・著作権侵害</option>
                    <option value="privacy">不同意・プライバシー侵害</option>
                    <option value="other">その他</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold">詳細（任意）</label>
                  <textarea
                    value={reportDetail}
                    onChange={(e) => setReportDetail(e.target.value)}
                    className="p-2 border rounded-md min-h-[100px]"
                    placeholder="詳細を入力してください"
                    style={{
                      backgroundColor: 'var(--background-color)',
                      color: 'var(--font-color)',
                      borderColor: 'var(--border-color)',
                    }}
                  />
                </div>

                <div className="flex justify-end gap-2 mt-2">
                  <button
                    onClick={() => setIsReportModalOpen(false)}
                    disabled={isReportingSubmitting}
                    className="px-4 py-2 rounded-md transition-colors cursor-pointer"
                    style={{
                      backgroundColor: 'var(--inconspicuous-background-color)',
                      color: 'var(--font-color)',
                    }}
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={executeReport}
                    disabled={isReportingSubmitting}
                    className="px-4 py-2 text-white rounded-md hover:bg-red-600 transition-colors cursor-pointer"
                    style={{
                      backgroundColor: 'var(--accent-color)',
                      opacity: isReportingSubmitting ? 0.7 : 1,
                    }}
                  >
                    {isReportingSubmitting ? '送信中...' : '通報する'}
                  </button>
                </div>
              </div>
            </Modal>
          </div>
          </PullToRefresh>
        ) : (
          <div className="p-4 text-center">アカウントが見つかりません</div>
        )
      }
    </>
  );
}
