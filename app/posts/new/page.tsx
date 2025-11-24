"use client";

import "./style.css";
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainHeader from '@/app/components/main_header/MainHeader';
import PostForm from '@/app/components/post/form';
import { useCurrentAccount } from '@/app/providers/CurrentAccountProvider';
import { useToast } from '@/app/providers/ToastProvider';

export default function Page() {
  const router = useRouter();
  const { currentAccountStatus } = useCurrentAccount();
  const { addToast } = useToast();

  useEffect(() => {
    if (currentAccountStatus === 'signed_out') {
      addToast({ title: 'エラー', message: 'サインインが必要です' });
      router.push('/');
    }
  }, [currentAccountStatus, router, addToast]);

  const handleSuccess = () => {
    router.push('/dashboard');
  };

  if (currentAccountStatus !== 'signed_in') {
    return null;
  }

  return (
    <>
      <MainHeader>
        新規作成
      </MainHeader>
      <div className="posts-new">
        <PostForm onSuccess={handleSuccess} />
      </div>
    </>
  );
}
