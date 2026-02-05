"use client";

import "./style.css";
import Link from "next/link";
import { useState } from "react";
import { api } from "@/lib/axios";
import { useToast } from "../providers/ToastProvider";
import MainHeader from '@/components/main_header/MainHeader';
import { Modal } from "@/components/modal/Modal";
import { useUI } from "../providers/UIProvider";
import { useCurrentAccount } from "../providers/CurrentAccountProvider";

export default function Page() {
  const [isSignoutModalOpen, setIsSignoutModalOpen] = useState(false);
  const { userTheme, toggleTheme } = useUI();
  const { currentAccount, currentAccountStatus } = useCurrentAccount();
  const { addToast } = useToast();

  const handleSignout = () => {
    if (currentAccountStatus) {
      api.delete('/signout').then((res) => {
        const data = res.data as { status: string; message: string; };
        addToast({
          title: 'サインアウトしました',
          message: '1秒後に再読み込みします'
        });
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      }).catch((error) => {
          addToast({
            title: 'エラー',
            message: error.message
          });
      });
    }else{
      addToast({
        title: 'エラー',
        message: 'サインインしていません'
      });
    }
  }

  return (
    <>
      <MainHeader>
        ダッシュボード
      </MainHeader>
      <div className="dashboard">
        {/* プロフィールカード */}
        <div className="dashboard-profile-card">
          <div className="dashboard-profile-banner">
            {currentAccount?.banner_url ? (
              <img 
                src={currentAccount.banner_url} 
                alt="Banner" 
                className="dashboard-banner-image"
              />
            ) : (
              <div className="dashboard-banner-placeholder" />
            )}
          </div>
          <div className="dashboard-profile-content">
            <div className="dashboard-profile-avatar">
              {currentAccount?.icon_url ? (
                <img 
                  src={currentAccount.icon_url} 
                  alt={currentAccount.name} 
                  className="dashboard-avatar-image"
                />
              ) : (
                <div className="dashboard-avatar-placeholder">
                  <span>👤</span>
                </div>
              )}
            </div>
            <div className="dashboard-profile-info">
              <div className="dashboard-profile-header">
                <div className="dashboard-profile-names">
                  <h2 className="dashboard-profile-name">
                    {currentAccountStatus === "loading" ? "読み込み中..." : currentAccount?.name || "ゲスト"}
                  </h2>
                  <span className="dashboard-profile-handle">
                    @{currentAccount?.name_id || "unknown"}
                  </span>
                </div>
                <div>
                  <Link href={`/@${currentAccount?.name_id || "/"}`} className="dashboard-profile-button">
                    プロフページ
                  </Link>
                  <Link href="/settings/account" className="dashboard-profile-button">
                    プロフ設定
                  </Link>
                </div>
              </div>
              <p className="dashboard-profile-description">
                {currentAccount?.description || "自己紹介文がまだ設定されていません。"}
              </p>
              <div className="dashboard-profile-stats">
                <div className="dashboard-stat">
                  <span className="dashboard-stat-value">{currentAccount?.followers_count ?? 0}</span>
                  <span className="dashboard-stat-label">フォロワー</span>
                </div>
                <div className="dashboard-stat">
                  <span className="dashboard-stat-value">{currentAccount?.following_count ?? 0}</span>
                  <span className="dashboard-stat-label">フォロー中</span>
                </div>
                <div className="dashboard-stat">
                  <span className="dashboard-stat-value">{currentAccount?.posts_count ?? 0}</span>
                  <span className="dashboard-stat-label">投稿</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 機能カードグリッド */}
        <div className="dashboard-features-grid">
          {/* お絵かき */}
          <div className="dashboard-feature-card dashboard-feature-canvas">
            <div className="dashboard-feature-icon">🎨✏️</div>
            <h3 className="dashboard-feature-title">お絵かき</h3>
            <p className="dashboard-feature-description">新しいのを描く</p>
            <Link href="/" className="dashboard-feature-link">
              みんなのを見る
            </Link>
          </div>

          {/* 絵文字 */}
          <div className="dashboard-feature-card dashboard-feature-emoji">
            <div className="dashboard-feature-icon">🫧🦄</div>
            <h3 className="dashboard-feature-title">絵文字</h3>
            <p className="dashboard-feature-description">新しいのを作る</p>
            <Link href="/" className="dashboard-feature-link">
              みんなのを見る
            </Link>
          </div>

          {/* お財布 */}
          <div className="dashboard-feature-card dashboard-feature-wallet">
            <div className="dashboard-feature-icon">🪙💴</div>
            <h3 className="dashboard-feature-title">お財布</h3>
            <p className="dashboard-feature-description">残高 000,000 AMV</p>
            <Link href="/" className="dashboard-feature-link">
              詳細を見る
            </Link>
          </div>

          {/* 現在地 */}
          <div className="dashboard-feature-card dashboard-feature-location">
            <div className="dashboard-feature-icon">📍🗺️</div>
            <h3 className="dashboard-feature-title">現在地</h3>
            <p className="dashboard-feature-description">実装予定</p>
            <span className="dashboard-feature-coming-soon">実装予定</span>
          </div>

          {/* コレクション */}
          <div className="dashboard-feature-card dashboard-feature-collection">
            <div className="dashboard-feature-icon">📚✨</div>
            <h3 className="dashboard-feature-title">コレクション</h3>
            <p className="dashboard-feature-description">お気に入りをまとめる</p>
            <Link href="/" className="dashboard-feature-link">
              コレクションを見る
            </Link>
          </div>

          {/* アチーブメント */}
          <div className="dashboard-feature-card dashboard-feature-achievement">
            <div className="dashboard-feature-icon">🏆🎖️</div>
            <h3 className="dashboard-feature-title">アチーブメント</h3>
            <p className="dashboard-feature-description">達成した実績</p>
            <Link href="/" className="dashboard-feature-link">
              実績を見る
            </Link>
          </div>
        </div>

        {/* ボタン一覧 */}
        <div className="dashboard-apps-container">
          <h3 className="dashboard-apps-title">ボタン一覧</h3>
          <div className="dashboard-apps-grid">
            <button onClick={()=> toggleTheme()} className="dashboard-app-item">
              <div className="dashboard-app-icon">{userTheme === "light" ? "☀️" : userTheme === "dark" ? "🌙" : "💻"}</div>
              <span className="dashboard-app-name">色モード変更</span>
            </button>
            <button onClick={()=> setIsSignoutModalOpen(true)} className="dashboard-app-item">
              <div className="dashboard-app-icon">👋</div>
              <span className="dashboard-app-name">サインアウト</span>
            </button>
            <Modal
              isOpen={isSignoutModalOpen}
              onClose={() => setIsSignoutModalOpen(false)}
              title="サインアウト確認"
            >
              <p>本当にサインアウトしますか？</p>
              <div className="modal-buttons">
                <button
                  className="cursor-pointer rounded mt-6 px-6 pb-2 pt-2.5 text-red-500 border-1 border-red-500"
                  onClick={() => {
                    handleSignout();
                    setIsSignoutModalOpen(false);
                  }}
                >
                  サインアウト
                </button>
                <button
                  className="cursor-pointer rounded ml-4 mt-6 px-6 pb-2 pt-2.5 border-1"
                  onClick={() => setIsSignoutModalOpen(false)}
                >
                  キャンセル
                </button>
              </div>
            </Modal>
            <Link href="/settings" className="dashboard-app-item">
              <div className="dashboard-app-icon">⚙️</div>
              <span className="dashboard-app-name">設定</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
