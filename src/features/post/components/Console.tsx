'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import styles from '../styles/Console.module.css'
import button_styles from '../styles/Button.module.css'
import { PostType } from '@/types/post'
import { Modal } from '@/components/modal/Modal'
import { useConsole } from '../hooks/useConsole'
import ConsoleReaction from './ConsoleReaction'

export default function Console({ post: initialPost }: { post: PostType }) {
  const router = useRouter()
  const {
    post,
    currentAccount,
    currentAccountStatus,
    isPostMenuOpen,
    setIsPostMenuOpen,
    isSignInModalOpen,
    setIsSignInModalOpen,
    isDiffuseConfirmOpen,
    setIsDiffuseConfirmOpen,
    isReportModalOpen,
    setIsReportModalOpen,
    reportCategory,
    setReportCategory,
    reportDetail,
    setReportDetail,
    handleAction,
    handleDelete,
    executeDiffuse,
    handleDiffuse,
    executeReport,
    handleReport,
  } = useConsole(initialPost)

  return (
    <div className={styles.console}>
      <div className={styles.content}>
        <button className={`${button_styles.button} ${styles.button_quote}`} disabled={post.is_busy === true} onClick={() => handleAction(() => router.push('/posts/new?quote=' + post.aid))}>
          <div className={styles.icon}>
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M44 20H11V56H35V71L29 71V80H44V20ZM89.0002 20H56.0002L56.0002 56H80.0002V71L74.0002 71V80H89.0002V20Z" fill="currentColor" />
            </svg>
          </div>
          <div className={styles.number}>{post.quotes_count}</div>
        </button>
      </div>

      <div className={styles.content}>
        <button className={`${button_styles.button} ${styles.button_diffuse} ${post.is_diffused ? button_styles.used : ''}`} disabled={post.is_busy === true} onClick={handleDiffuse}>
          <div className={styles.icon}>
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M48.1816 12.3858C49.2557 11.5673 50.7443 11.5673 51.8184 12.3858L86.2339 38.6139C88.5177 40.3544 87.2868 44 84.4155 44H15.5846C12.7132 44 11.4824 40.3544 13.7661 38.6139L48.1816 12.3858ZM21 68H37V77C37 79.7614 34.7614 82 32 82H26C23.2386 82 21 79.7614 21 77V68ZM63 68H79V77C79 79.7614 76.7614 82 74 82H68C65.2386 82 63 79.7614 63 77V68ZM59 68H41V83C41 85.7614 43.2386 88 46 88H54C56.7614 88 59 85.7614 59 83V68ZM21 48C18.2386 48 16 50.2386 16 53V59C16 61.7614 18.2386 64 21 64H79C81.7614 64 84 61.7614 84 59V53C84 50.2386 81.7614 48 79 48H21Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <div className={styles.number}>{post.diffuses_count}</div>
        </button>
      </div>

      <div className={styles.content}>
        <ConsoleReaction post={post} />
      </div>

      <div className={styles.content}>
        <button className={`${button_styles.button} ${styles.button_reply}`} disabled={post.is_busy === true} onClick={() => handleAction(() => router.push('/posts/new?reply=' + post.aid))}>
          <div className={styles.icon}>
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M11 19C11 16.2386 13.2386 14 16 14H84C86.7614 14 89 16.2386 89 19V59C89 61.7614 86.7614 64 84 64H80.1939C77.706 64 75.6814 62.1077 74.5909 59.8715C72.3182 55.211 67.5341 52 62 52C56.4659 52 51.6818 55.211 49.4091 59.8715C48.3186 62.1077 46.294 64 43.8061 64H16C13.2386 64 11 61.7614 11 59V19ZM52 66C52 60.4772 56.4772 56 62 56C67.5229 56 72 60.4772 72 66C72 71.5229 67.5229 76 62 76C56.4772 76 52 71.5229 52 66ZM42 80C42 76.6863 44.6863 74 48 74C51.3137 74 54 76.6863 54 80C54 83.3137 51.3137 86 48 86C44.6863 86 42 83.3137 42 80Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <div className={styles.number}>{post.replies_count}</div>
        </button>
      </div>

      <div className={styles.content}>
        <button className={`${button_styles.button} ${styles.button_menu}`} onClick={() => setIsPostMenuOpen(true)}>
          <div className={styles.icon}>
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M30 15C21.7157 15 15 21.7157 15 30C15 38.2843 21.7157 45 30 45C38.2843 45 45 38.2843 45 30C45 21.7157 38.2843 15 30 15ZM70 15C61.7157 15 55 21.7157 55 30C55 38.2843 61.7157 45 70 45C78.2843 45 85 38.2843 85 30C85 21.7157 78.2843 15 70 15ZM55 70C55 61.7157 61.7157 55 70 55C78.2843 55 85 61.7157 85 70C85 78.2843 78.2843 85 70 85C61.7157 85 55 78.2843 55 70ZM30 55C21.7157 55 15 61.7157 15 70C15 78.2843 21.7157 85 30 85C38.2843 85 45 78.2843 45 70C45 61.7157 38.2843 55 30 55Z"
                fill="currentColor"
              />
            </svg>
          </div>
        </button>

        <Modal isOpen={isPostMenuOpen} onClose={() => setIsPostMenuOpen(false)} title="投稿メニュー">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>投稿のID: {post.aid}</div>
            <div>作成日: {new Date(post.created_at).toLocaleString()}</div>
            {currentAccount?.aid === post.account.aid && (
              <button onClick={handleDelete} style={{ color: 'red', cursor: 'pointer', padding: '8px', border: '1px solid red', borderRadius: '4px', background: 'transparent' }}>
                投稿を削除
              </button>
            )}
            {currentAccountStatus === 'signed_in' && currentAccount?.aid !== post.account.aid && (
              <button onClick={handleReport} style={{ color: 'red', cursor: 'pointer', padding: '8px', border: '1px solid red', borderRadius: '4px', background: 'transparent' }}>
                投稿を通報
              </button>
            )}
          </div>
        </Modal>

        <Modal isOpen={isSignInModalOpen} onClose={() => setIsSignInModalOpen(false)} title="サインインが必要です">
          <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p>この操作を行うにはサインインが必要です。</p>
            <Link prefetch={false} href="/signin" style={{ color: '#1d9bf0', textDecoration: 'none' }}>
              サインインする
            </Link>
          </div>
        </Modal>

        <Modal isOpen={isDiffuseConfirmOpen} onClose={() => setIsDiffuseConfirmOpen(false)} title="拡散を取り消す" width="max-w-sm">
          <div className="flex flex-col gap-4">
            <p>拡散を取り消しますか？</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsDiffuseConfirmOpen(false)} className="px-4 py-2 rounded-md hover:bg-gray-100 transition-colors">
                キャンセル
              </button>
              <button
                onClick={() => {
                  executeDiffuse()
                  setIsDiffuseConfirmOpen(false)
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                取り消す
              </button>
            </div>
          </div>
        </Modal>

        <Modal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} title="投稿を通報">
          <div className="flex flex-col gap-4 p-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold">通報の理由</label>
              <select
                value={reportCategory}
                onChange={(e) => setReportCategory(e.target.value)}
                className="p-2 border rounded-md"
                style={{ backgroundColor: 'var(--background-color)', color: 'var(--font-color)', borderColor: 'var(--border-color)' }}
              >
                <option value="spam">スパム・迷惑</option>
                <option value="hate">ヘイト・嫌がらせ・いじめ・差別</option>
                <option value="disinformation">偽情報・なりすまし</option>
                <option value="violence">暴力的・テロ・過激的思想</option>
                <option value="sensitive">センシティブ・性的・残酷</option>
                <option value="suicide">自殺・自傷</option>
                <option value="illegal">違法・規制対象・詐欺・不正</option>
                <option value="theft">盗用・著作権侵害</option>
                <option value="privacy">不同意・プライバシー侵害</option>
                <option value="other">その他</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold">詳細（任意）</label>
              <textarea
                value={reportDetail}
                onChange={(e) => setReportDetail(e.target.value)}
                className="p-2 border rounded-md min-h-[100px]"
                placeholder="詳細を入力してください"
                style={{ backgroundColor: 'var(--background-color)', color: 'var(--font-color)', borderColor: 'var(--border-color)' }}
              />
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="px-4 py-2 rounded-md transition-colors cursor-pointer"
                style={{ backgroundColor: 'var(--inconspicuous-background-color)', color: 'var(--font-color)' }}
              >
                キャンセル
              </button>
              <button onClick={executeReport} className="px-4 py-2 text-white rounded-md hover:bg-red-600 transition-colors cursor-pointer" style={{ backgroundColor: 'var(--attention-color)' }}>
                通報する
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  )
}
