"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useCurrentAccount } from '@/app/providers/CurrentAccountProvider';
import { useToast } from '@/app/providers/ToastProvider';
import Link from 'next/link';
import { useEffect } from 'react';
import { api } from '../lib/axios';
import MainHeader from '../components/main_header/MainHeader';

export default function SignInPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { currentAccountStatus } = useCurrentAccount();
  const searchParams = useSearchParams();
  const name = searchParams.get('name');
  const name_id = searchParams.get('name_id');
  const description = searchParams.get('description');

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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const submitName = formData.get('name');
    const submitNameId = formData.get('name_id');
    const submitDescription = formData.get('description');

    api.post('/signup', {account: { name: submitName, name_id: submitNameId, description: submitDescription }})
      .then((response) => {
        const data = response.data;
        if (data.status === 'success') {
          addToast({
            title: 'アカウント作成完了',
            message: data.message,
          });
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
        }
      })
      .catch((error) => {
        const data = error.response?.data;
        const errorMessage = data?.errors ? data.errors.join('\n') : 'サインアップに失敗しました';
        addToast({
          title: data?.message || 'エラー',
          message: errorMessage,
        });
      });
  };

  return (
    <>
      <MainHeader>
        Sign Up
      </MainHeader>
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-3xl font-bold mb-6">Sign Up</h1>
        <form onSubmit={handleSubmit}>
          <label className="block mb-4">名前</label>
          <input type="text" name="name" placeholder="Name" defaultValue={name ?? ''} className="border p-2 mb-4 w-64" /><br />
          
          <label className="block mb-4">ID</label>
          <input type="text" name="name_id" placeholder="Name ID" defaultValue={name_id ?? ''} className="border p-2 mb-4 w-64" /><br />
          
          <label className="block mb-4">説明</label>
          <textarea name="description" placeholder="Description" defaultValue={description ?? ''} className="border p-2 mb-4 w-64 h-24"></textarea><br />
          <button type="submit" className="cursor-pointer">Sign Up</button>
        </form>
      </div>
    </>
  );
};
