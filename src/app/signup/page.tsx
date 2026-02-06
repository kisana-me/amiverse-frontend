"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useCurrentAccount } from '@/app/providers/CurrentAccountProvider';
import { useToast } from '@/app/providers/ToastProvider';
import Link from 'next/link';
import { useEffect, Suspense, useState } from 'react';
import { api } from '@/lib/axios';
import MainHeader from '@/components/main_header/MainHeader';
import './style.css';

function SignupContent() {
  const router = useRouter();
  const { addToast } = useToast();
  const { currentAccountStatus } = useCurrentAccount();
  const searchParams = useSearchParams();
  const name = searchParams.get('name');
  const name_id = searchParams.get('name_id');
  const description = searchParams.get('description');

  const [formName, setFormName] = useState(name ?? '');
  const [formNameId, setFormNameId] = useState(name_id ?? '');
  const [formDescription, setFormDescription] = useState(description ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const isNameValid = formName.length >= 1 && formName.length <= 50;
  const isNameIdValid = /^[a-zA-Z0-9_]{5,50}$/.test(formNameId);
  const isDescriptionValid = formDescription.length <= 500;
  const isFormValid = isNameValid && isNameIdValid && isDescriptionValid;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    api.post('/signup', {account: { name: formName, name_id: formNameId, description: formDescription }})
      .then((response) => {
        const data = response.data;
        if (data.status === 'success') {
          addToast({
            message: 'アカウント作成完了',
            detail: data.message,
          });
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
        }
      })
      .catch((error) => {
        setIsSubmitting(false);
        const data = error.response?.data;
        const errorMessage = data?.errors ? data.errors.join('\n') : 'サインアップに失敗しました';
        addToast({
          message: data?.message || 'エラー',
          detail: errorMessage,
        });
      });
  };

  const getDescriptionCounterClass = () => {
    if (formDescription.length > 500) return 'form-counter error';
    if (formDescription.length > 450) return 'form-counter warning';
    return 'form-counter';
  };

  return (
    <>
      <MainHeader>
        アカウント作成
      </MainHeader>
      <div className="signup-page">
        
        <div className="signup-content">
          <div className="signup-container">
            <div className="signup-header">
              <h1>アカウント作成</h1>
              <p>Amiverseであなたを表す情報を入力してください</p>
            </div>

            <form className="signup-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">
                  表示名
                  <span className="form-label-required">必須</span>
                </label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  placeholder="例: たろう"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  maxLength={50}
                />
                <span className="form-hint">1〜50文字で入力してください</span>
              </div>

              <div className="form-group">
                <label className="form-label">
                  ID
                  <span className="form-label-required">必須</span>
                </label>
                <input
                  type="text"
                  name="name_id"
                  className="form-input"
                  placeholder="例: taro_123"
                  value={formNameId}
                  onChange={(e) => setFormNameId(e.target.value)}
                  maxLength={50}
                />
                <span className="form-hint">5〜50文字の半角英数字とアンダーバー(_)が使えます</span>
              </div>

              <div className="form-group">
                <label className="form-label">
                  自己紹介
                  <span className="form-label-optional">任意</span>
                </label>
                <textarea
                  name="description"
                  className="form-input form-textarea"
                  placeholder="あなたについて教えてください..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  maxLength={500}
                />
                <div className={getDescriptionCounterClass()}>
                  {formDescription.length} / 500
                </div>
              </div>

              <button 
                type="submit" 
                className="signup-button"
                disabled={!isFormValid || isSubmitting}
              >
                {isSubmitting ? '作成中...' : 'アカウントを作成'}
              </button>
            </form>

            <div className="signup-tips">
              <div className="signup-tips-title">
                💡 ヒント
              </div>
              <ul>
                <li>入力内容はすべていつでも変更できます</li>
                <li>IDはあなた専用のURLになります</li>
                <li>自己紹介は入力しなくてもよいです</li>
              </ul>
            </div>

            <div className="signup-footer">
              <p>
                作成することで<Link href="/terms-of-service">利用規約</Link>と
                <Link href="/privacy-policy">プライバシーポリシー</Link>に同意したことになります
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default function Page() {
  return (
    <Suspense>
      <SignupContent />
    </Suspense>
  );
}
