"use client";

import "./style.css";
import MainHeader from '@/components/main_header/MainHeader';
import { useUI } from "../providers/UIProvider";
import { useCurrentAccount } from "../providers/CurrentAccountProvider";
import { api } from "@/lib/axios";
import { useToast } from "../providers/ToastProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Page() {
  const { userTheme, toggleTheme } = useUI();
  const { addToast } = useToast();
  const { currentAccountStatus, setCurrentAccountStatus } = useCurrentAccount();
  const router = useRouter();

  const handleSignout = () => {
    if (currentAccountStatus) {
      api.delete('/signout').then((res) => {
        addToast({
          title: 'サインアウトしました',
          message: '2秒後に再読み込みします'
        });
        setCurrentAccountStatus('signed_out');
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      }).catch((error) => {
          addToast({
            title: 'エラー',
            message: error.message
          });
      });
    } else {
      addToast({
        title: 'エラー',
        message: 'サインインしていません'
      });
    }
  }

  const settingsItems = [
    { href: "/settings/account", label: "アカウント設定", description: "プロフィールやアカウント情報の変更" },
    { href: "/settings/notifications", label: "通知設定", description: "通知設定の変更" },
    { href: "/settings/leave", label: "アカウント削除", description: "アカウントの削除", danger: true },
  ];

  return (
    <>
      <MainHeader>
        設定
      </MainHeader>
      <div className="max-w-2xl mx-auto p-4">
        <div className="space-y-4">
          <section className="bg-[var(--inactive-background-color)] rounded-lg p-4 shadow-sm">
            <h2 className="text-xl font-bold mb-4 text-[var(--font-color)]">一般</h2>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-[var(--font-color)]">色モード</div>
                <div className="text-sm text-[var(--inconspicuous-font-color)]">現在: {userTheme}</div>
              </div>
              <button 
                onClick={toggleTheme}
                className="px-4 py-2 rounded bg-[var(--button-color)] text-[var(--button-font-color)] hover:opacity-80 transition-opacity"
              >
                色モード変更
              </button>
            </div>
          </section>

          <section className="bg-[var(--inactive-background-color)] rounded-lg p-4 shadow-sm">
            <h2 className="text-xl font-bold mb-4 text-[var(--font-color)]">アカウント</h2>
            <div className="space-y-2">
              {settingsItems.map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className={`block p-3 rounded hover:bg-[var(--hover-color)] transition-colors ${item.danger ? 'text-red-500' : 'text-[var(--link-color)]'}`}
                >
                  <div className="font-medium">{item.label}</div>
                  <div className="text-sm text-[var(--inconspicuous-font-color)]">{item.description}</div>
                </Link>
              ))}
            </div>
          </section>

          <section className="bg-[var(--inactive-background-color)] rounded-lg p-4 shadow-sm">
             <h2 className="text-xl font-bold mb-4 text-[var(--font-color)]">セッション</h2>
             {currentAccountStatus === 'signed_in' ? (
                <button 
                  onClick={handleSignout}
                  className="w-full px-4 py-2 rounded bg-[var(--button-color)] text-[var(--button-font-color)] hover:opacity-80 transition-opacity"
                >
                  サインアウト
                </button>
              ) : (
                <Link 
                  href='/signin'
                  className="block w-full text-center px-4 py-2 rounded bg-[var(--primary-color)] text-white hover:opacity-80 transition-opacity"
                >
                  サインイン
                </Link>
              )}
          </section>
        </div>
      </div>
    </>
  );
}
