'use client'

import MainHeader from '@/components/main_header/MainHeader'
import { useUI } from '@/providers/UIProvider'
import { useCurrentAccount } from '@/providers/CurrentAccountProvider'
import { api } from '@/lib/axios'
import { useToast } from '@/providers/ToastProvider'
import Link from 'next/link'

export default function Page() {
  const { userTheme, toggleTheme } = useUI()
  const { addToast } = useToast()
  const { currentAccountStatus, setCurrentAccountStatus } = useCurrentAccount()

  const handleSignout = () => {
    if (currentAccountStatus) {
      api
        .delete('/signout')
        .then((res) => {
          addToast({
            message: 'サインアウトしました',
            detail: '2秒後に再読み込みします',
          })
          setCurrentAccountStatus('signed_out')
          setTimeout(() => {
            window.location.href = '/'
          }, 2000)
        })
        .catch((error) => {
          addToast({
            message: 'エラー',
            detail: error instanceof Error ? error.message : String(error),
          })
        })
    } else {
      addToast({
        message: 'エラー',
        detail: 'サインインしていません',
      })
    }
  }

  const settingsItems = [
    { href: '/settings/account', label: 'アカウント設定', description: 'プロフィールやアカウント情報の変更' },
    { href: '/settings/notifications', label: '通知設定', description: '通知設定の変更' },
    { href: '/settings/leave', label: 'アカウント削除', description: 'アカウントの削除', danger: true },
  ]

  return (
    <>
      <MainHeader>設定</MainHeader>
      <div className="max-w-2xl mx-auto p-4">
        <div className="space-y-4">
          <section className="p-4">
            <h2 className="text-xl font-bold mb-4">一般</h2>
            <div className="flex items-center justify-between p-3 rounded hover:bg-[var(--hover-color)] transition-colors">
              <div>
                <div className="font-medium">色モード</div>
                <div className="text-sm text-[var(--inconspicuous-font-color)]">現在: {userTheme}</div>
              </div>
              <button onClick={toggleTheme} className="px-4 py-2 rounded bg-[var(--button-color)] text-[var(--button-font-color)] cursor-pointer hover:opacity-80 transition-opacity">
                色モード変更
              </button>
            </div>
          </section>

          <section className="p-4">
            <h2 className="text-xl font-bold mb-4">アカウント</h2>
            <div className="space-y-2">
              {settingsItems.map((item) => (
                <Link
                  prefetch={false}
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

          <section className="p-4">
            <h2 className="text-xl font-bold mb-4">セッション</h2>
            <div className="p-3 rounded hover:bg-[var(--hover-color)] transition-colors">
              {currentAccountStatus === 'signed_in' ? (
                <>
                  <div className="mb-1 font-medium">サインアウト・ログアウト</div>
                  <button onClick={handleSignout} className="w-full px-4 py-2 rounded bg-[var(--button-color)] text-[var(--button-font-color)] cursor-pointer hover:opacity-80 transition-opacity">
                    サインアウト
                  </button>
                </>
              ) : (
                <>
                  <div className="mb-1 font-medium">サインイン・サインアップ</div>
                  <Link
                    prefetch={false}
                    href="/signin"
                    className="block w-full text-center px-4 py-2 rounded bg-[var(--inconspicuous-background-color)] text-[var(--font-color)] cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    サインイン
                  </Link>
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
