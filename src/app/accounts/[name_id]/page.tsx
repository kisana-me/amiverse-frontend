"use client";

import MainHeader from "@/components/main_header/MainHeader";
import { api } from "@/lib/axios";
import { Modal } from '@/components/modal/Modal';
import { use, useEffect, useState, useCallback } from "react";
import SkeletonAccount from "./skeleton_account";
import { formatFullDate } from "@/lib/format_time";
import "./page.css";
import { usePosts, CachedPost } from "@/providers/PostsProvider";
import { useFeeds } from "@/providers/FeedsProvider";
import Feed from "@/components/feed/feed";
import { PostType } from "@/types/post";
import { FeedItemType } from "@/types/feed";
import { useToast } from "@/providers/ToastProvider";
import { useCurrentAccount } from "@/providers/CurrentAccountProvider";
import { useAccounts } from "@/providers/AccountsProvider";
import ItemContent from "@/components/post/item_content";

type Props = {
  params: Promise<{
    name_id: string;
  }>;
};

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

  const { addToast } = useToast();
  const { addPosts, getPost } = usePosts();
  const { addFeed, appendFeed, feeds } = useFeeds();
  const { currentAccountStatus, currentAccount } = useCurrentAccount();

  const [posts, setPosts] = useState<PostType[]>(() => {
    if (account && feeds[account.aid]) {
      const cachedFeed = feeds[account.aid];
      if (cachedFeed && Array.isArray(cachedFeed.objects)) {
        return cachedFeed.objects
          .map((item) => getPost(item.post_aid))
          .filter((p): p is CachedPost => !!p);
      }
    }
    return [];
  });
  const [isFeedLoading, setIsFeedLoading] = useState(!!account && !feeds[account.aid]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

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

  const fetchFeed = useCallback(async (aid: string) => {
    if (feeds[aid]) return;
    
    setIsFeedLoading(true);
    try {
      const res = await api.post('/feeds/account', { aid });
      if (!res.data) return;

      const data = res.data as { posts: PostType[], feed?: FeedItemType[] };

      if (data.posts) {
        addPosts(data.posts);
      }

      if (data.feed) {
        addFeed({ type: aid, objects: data.feed });
      } else if (data.posts) {
        const generatedFeed: FeedItemType[] = data.posts.map(post => ({
          type: 'post',
          post_aid: post.aid,
        }));
        addFeed({ type: aid, objects: generatedFeed });
      }
    } catch (error) {
      addToast({
        message: "投稿取得エラー",
        detail: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsFeedLoading(false);
    }
  }, [addPosts, addFeed, addToast, feeds]);

  useEffect(() => {
    if (currentAccountStatus === 'loading') return;
    if (!account) return;
    if (!feeds[account.aid]) {
        fetchFeed(account.aid);
    }
  }, [account, feeds, fetchFeed, currentAccountStatus]);

  useEffect(() => {
    if (!account) return;
    const cachedFeed = feeds[account.aid];
    if (cachedFeed && Array.isArray(cachedFeed.objects)) {
      const cachedPosts = cachedFeed.objects.map(item => getPost(item.post_aid)).filter((p): p is CachedPost => !!p);
      setPosts(cachedPosts);
    }
  }, [feeds, account, getPost]);

  const loadMore = async () => {
    if (isLoadingMore || !hasMore || posts.length === 0 || !account) return;
    
    const lastPost = posts[posts.length - 1];
    setIsLoadingMore(true);

    try {
      const cursor = Math.floor(new Date(lastPost.created_at).getTime() / 1000);
      const res = await api.post('/feeds/account', {
        aid: account.aid,
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
        appendFeed({ type: account.aid, objects: newFeedItems });
      } else if (newPosts.length > 0) {
        const generatedFeed: FeedItemType[] = newPosts.map(post => ({
          type: 'post',
          post_aid: post.aid,
        }));
        appendFeed({ type: account.aid, objects: generatedFeed });
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

            <div className="account-tab">
              <div className="account-tab-selector active">投稿</div>
              <div className="account-tab-selector">返信</div>
              <div className="account-tab-selector">メディア</div>
              <div className="account-tab-selector">リアクション</div>
            </div>

            <div className="account-content">
              <Feed 
                posts={posts} 
                feed={account && feeds[account.aid] ? { ...feeds[account.aid], type: account.aid, fetched_at: feeds[account.aid].fetched_at?.toString() } : undefined} 
                is_loading={isFeedLoading} 
              />
              
              {hasMore && posts.length > 0 && !isFeedLoading && (
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
        ) : (
          <div className="p-4 text-center">アカウントが見つかりません</div>
        )
      }
    </>
  );
}
