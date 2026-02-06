"use client";

import { useRouter } from 'next/navigation';
import { useCurrentAccount } from '@/app/providers/CurrentAccountProvider';
import { useToast } from '@/app/providers/ToastProvider';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import './style.css';
import MainHeader from '@/components/main_header/MainHeader';

export default function SignInPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { currentAccountStatus } = useCurrentAccount();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentAccountStatus === 'signed_in') {
      addToast({
        message: 'サインイン済み',
        detail: 'あなたはすでにサインイン済みです',
      });
      router.push('/');
    }
  }, [currentAccountStatus, addToast, router]);

  if (currentAccountStatus === 'signed_in') {
    return null;
  }

  const handleSigns = () => {
    setIsLoading(true);
    api.post('/oauth/start').then((response) => {
      const { url } = response.data;
      window.location.href = url;
    }).catch(() => {
      setIsLoading(false);
      addToast({
        message: 'エラー',
        detail: 'サインイン/サインアップの開始に失敗しました',
      });
    });
  }

  return (
    <>
      <MainHeader>
        Amiverseへようこそ
      </MainHeader>
      <div className="signin-page">
        <div className="signin-container">
          <div className="signin-logo">
            <Image
              src="/static-assets/images/amiverse-logo-alpha-400.png"
              alt="Amiverseのロゴ"
              width={80}
              height={80}
            />
          </div>
          
          <div className="signin-header">
            <h1>Amiverseへようこそ</h1>
            <p>320×120の白黒ドット絵を描いて共有できる、無料のソーシャルメディア</p>
          </div>

          <div className="signin-features">
            <div className="signin-feature">
              <span className="signin-feature-icon">🎨</span>
              <span>白黒ドット絵を描いて投稿</span>
            </div>
            <div className="signin-feature">
              <span className="signin-feature-icon">💬</span>
              <span>テキストで自由にコミュニケーション</span>
            </div>
            <div className="signin-feature">
              <span className="signin-feature-icon">🆓</span>
              <span>完全無料で利用可能</span>
            </div>
          </div>

          <button 
            className="anyur-button" 
            onClick={() => handleSigns()}
            disabled={isLoading}
          >
            <span className="anyur-button-icon">🔐</span>
            {isLoading ? '接続中...' : 'ANYURで続ける'}
          </button>

          <div className="signin-divider">
            <span>ANYURとは？</span>
          </div>

          <div className="signin-info">
            <p>
              ANYURは無料のアカウント連携サービスです。<br />
              一度登録すれば、対応サービスにワンクリックでログインできます。
            </p>
          </div>

          <div className="signin-footer">
            <p>
              利用規約は<Link href="/terms-of-service">こちら</Link>、
              プライバシーポリシーは<Link href="/privacy-policy">こちら</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
