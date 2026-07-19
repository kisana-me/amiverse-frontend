"use client";

import "./style.css";
import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import MainHeader from '@/components/main_header/MainHeader';
import PostForm from '@/components/post/form';
import { useCurrentAccount } from '@/providers/CurrentAccountProvider';
import { useToast } from '@/providers/ToastProvider';

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const community = searchParams.get('community') || undefined;
  const { currentAccountStatus } = useCurrentAccount();
  const { addToast } = useToast();

  useEffect(() => {
    if (currentAccountStatus === 'signed_out') {
      addToast({ message: 'エラー', detail: 'サインインが必要です' });
      router.push('/');
    }
  }, [currentAccountStatus, router, addToast]);

  const handleSuccess = () => {
    router.push(community ? `/communities/${community}` : '/');
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
        <PostForm community={community} onSuccess={handleSuccess} />
      </div>
    </>
  );
}
