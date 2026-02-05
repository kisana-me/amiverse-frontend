"use client";

import React, { useState } from 'react';
import MainHeader from '@/components/main_header/MainHeader';
import { api } from '@/lib/axios';
import { useToast } from '../../providers/ToastProvider';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/modal/Modal';
import { useCurrentAccount } from '../../providers/CurrentAccountProvider';

export default function LeavePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToast } = useToast();
  const router = useRouter();
  const { setCurrentAccountStatus } = useCurrentAccount();

  const handleLeave = async () => {
    try {
      const res = await api.delete('/settings/leave');
      if (res.data.status === 'success') {
        addToast({
          title: '退会しました',
          message: 'ご利用ありがとうございました。',
        });
        setCurrentAccountStatus('signed_out');
        router.push('/');
      }
    } catch (error: any) {
      addToast({
        title: 'エラー',
        message: error.response?.data?.message || '退会に失敗しました',
      });
    } finally {
      setIsModalOpen(false);
    }
  };

  return (
    <>
      <MainHeader>
        Delete Account
      </MainHeader>
      <div className="p-4 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-[var(--font-color)]">アカウント削除</h1>
        <p className="mb-4 text-[var(--font-color)]">
          アカウントを削除すると、全てのデータが失われます。この操作は取り消せません。
        </p>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
        >
          アカウントを削除する
        </button>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="確認">
          <div className="p-4">
            <p className="mb-4 text-[var(--font-color)]">本当にアカウントを削除しますか？</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
              >
                キャンセル
              </button>
              <button
                onClick={handleLeave}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              >
                削除する
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
}
