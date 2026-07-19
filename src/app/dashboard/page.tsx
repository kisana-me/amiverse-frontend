'use client'

import styles from './styles.module.css'
import Link from 'next/link'
import { useState } from 'react'
import { api } from '@/lib/axios'
import { useToast } from '@/providers/ToastProvider'
import MainHeader from '@/components/main_header/MainHeader'
import { Modal } from '@/components/modal/Modal'
import { useUI } from '@/providers/UIProvider'
import { useCurrentAccount } from '@/providers/CurrentAccountProvider'
import Heatmap from './_components/heatmap'

const FEATURES = [
  { icon: '🎨✏️', title: 'お絵描き', description: 'あなたの作品展', href: '/', linkLabel: '---' },
  { icon: '🫧🦄', title: '絵文字', description: 'リアクション探し', href: '/', linkLabel: '---' },
  { icon: '📸🌈', title: 'メディア', description: 'メディアを管理', href: '/', linkLabel: '---' },
  { icon: '🪙💴', title: 'お財布', description: 'コインの残高と履歴', href: '/coin', linkLabel: '詳細を見る' },
  { icon: '📚🔖', title: '保存済み', description: '保存したもの', href: '/', linkLabel: '---' },
  { icon: '🏆🎖️', title: '実績', description: '達成の歴史', href: '/', linkLabel: '---' },
]

export default function Page() {
  const [isSignoutModalOpen, setIsSignoutModalOpen] = useState(false)
  const { userTheme, toggleTheme } = useUI()
  const { currentAccount, currentAccountStatus } = useCurrentAccount()
  const { addToast } = useToast()

  const handleSignout = () => {
    if (!currentAccountStatus) {
      addToast({ message: 'サインアウトできませんでした', detail: 'サインインしていません' })
      return
    }
    api
      .delete('/signout')
      .then(() => {
        addToast({ message: 'サインアウトしました', detail: '1秒後に再読み込みします' })
        setTimeout(() => {
          window.location.href = '/'
        }, 1000)
      })
      .catch((error) => {
        addToast({ message: 'サインアウトできませんでした', detail: error.message })
      })
  }

  return (
    <>
      <MainHeader>ダッシュボード</MainHeader>
      <div className={styles.page}>
        <section className={styles.profile}>
          <div className={styles.banner}>
            {currentAccount?.banner_url ? <img src={currentAccount.banner_url} alt="Banner" className={styles.banner_image} /> : <div className={styles.banner_placeholder} />}
          </div>
          <div className={styles.profile_content}>
            <div className={styles.avatar}>
              {currentAccount?.icon_url ? <img src={currentAccount.icon_url} alt={currentAccount.name} className={styles.avatar_image} /> : <div className={styles.avatar_placeholder}>👤</div>}
            </div>
            <div className={styles.profile_info}>
              <div className={styles.profile_header}>
                <div className={styles.names}>
                  <h2 className={styles.name}>{currentAccountStatus === 'loading' ? '読み込み中...' : currentAccount?.name || 'ゲスト'}</h2>
                  <span className={styles.handle}>@{currentAccount?.name_id || 'unknown'}</span>
                </div>
                <div className={styles.actions}>
                  <Link prefetch={false} href={`/@${currentAccount?.name_id || '/'}`} className={styles.action}>
                    プロフページ
                  </Link>
                  <Link prefetch={false} href="/settings/account" className={styles.action}>
                    プロフ設定
                  </Link>
                </div>
              </div>
              <p className={styles.description}>{currentAccount?.description || '自己紹介文がまだ設定されていません。'}</p>
              <div className={styles.stats}>
                <div className={styles.stat}>
                  <span className={styles.stat_value}>{currentAccount?.followers_count ?? 0}</span>
                  <span className={styles.stat_label}>フォロワー</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.stat_value}>{currentAccount?.following_count ?? 0}</span>
                  <span className={styles.stat_label}>フォロー中</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.stat_value}>{currentAccount?.posts_count ?? 0}</span>
                  <span className={styles.stat_label}>投稿</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Heatmap />

        <section className={styles.features}>
          {FEATURES.map((feature) => (
            <div className={styles.feature} key={feature.title}>
              <div className={styles.feature_icon}>{feature.icon}</div>
              <h3 className={styles.feature_title}>{feature.title}</h3>
              <p className={styles.feature_description}>{feature.description}</p>
              <Link prefetch={false} href={feature.href} className={styles.feature_link}>
                {feature.linkLabel}
              </Link>
            </div>
          ))}
        </section>

        <section>
          <div className={styles.apps_grid}>
            <button onClick={() => toggleTheme()} className={styles.app}>
              <div className={styles.app_icon}>{userTheme === 'light' ? '☀️' : userTheme === 'dark' ? '🌙' : '💻'}</div>
              <span className={styles.app_name}>色モード</span>
            </button>
            <button onClick={() => setIsSignoutModalOpen(true)} className={styles.app}>
              <div className={styles.app_icon}>👋</div>
              <span className={styles.app_name}>サインアウト</span>
            </button>
            <Link prefetch={false} href="/settings" className={styles.app}>
              <div className={styles.app_icon}>⚙️</div>
              <span className={styles.app_name}>設定</span>
            </Link>
          </div>
        </section>
      </div>

      <Modal isOpen={isSignoutModalOpen} onClose={() => setIsSignoutModalOpen(false)} title="サインアウト確認">
        <p>本当にサインアウトしますか？</p>
        <div className={styles.modal_buttons}>
          <button
            className={`${styles.modal_button} ${styles.modal_button_danger}`}
            onClick={() => {
              handleSignout()
              setIsSignoutModalOpen(false)
            }}
          >
            サインアウト
          </button>
          <button className={styles.modal_button} onClick={() => setIsSignoutModalOpen(false)}>
            キャンセル
          </button>
        </div>
      </Modal>
    </>
  )
}
