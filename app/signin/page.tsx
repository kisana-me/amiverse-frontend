"use client";

import { useRouter } from 'next/navigation';
import { useCurrentAccount } from '@/app/providers/CurrentAccountProvider';
import { useToast } from '@/app/providers/ToastProvider';
import Link from 'next/link';
import { useEffect } from 'react';
import { api } from '../lib/axios';

export default function SignInPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { currentAccountStatus } = useCurrentAccount();

  useEffect(() => {
    if (currentAccountStatus === 'signed_in') {
      addToast({
        title: 'サインイン済み',
        message: 'あなたはすでにサインイン済みです',
      });
      router.push('/');
    }
  }, [currentAccountStatus, addToast, router]);

  if (currentAccountStatus === 'signed_in') {
    return null;
  }

  const handleSigns = () => {
    api.post('/oauth/start').then((response) => {
      const { url } = response.data;
      window.location.href = url;
    }).catch((error) => {
      addToast({
        title: 'エラー',
        message: 'サインイン/サインアップの開始に失敗しました',
      });
    });
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-6">Sign In</h1>
      <button className="cursor-pointer" onClick={()=>{handleSigns()}}>ANYURでサインイン/サインアップ</button>
    </main>
  );
};
