'use client'

import { Modal } from '@/components/modal/Modal'

type Props = {
  isOpen: boolean
  onClose: () => void
  category: string
  onCategoryChange: (category: string) => void
  detail: string
  onDetailChange: (detail: string) => void
  submitting: boolean
  onSubmit: () => void
}

export default function AccountReportModal({ isOpen, onClose, category, onCategoryChange, detail, onDetailChange, submitting, onSubmit }: Props) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="アカウントを通報">
      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold">通報の理由</label>
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="p-2 border rounded-md"
            style={{
              backgroundColor: 'var(--background-color)',
              color: 'var(--font-color)',
              borderColor: 'var(--border-color)',
            }}
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
            value={detail}
            onChange={(e) => onDetailChange(e.target.value)}
            className="p-2 border rounded-md min-h-[100px]"
            placeholder="詳細を入力してください"
            style={{
              backgroundColor: 'var(--background-color)',
              color: 'var(--font-color)',
              borderColor: 'var(--border-color)',
            }}
          />
        </div>

        <div className="flex justify-end gap-2 mt-2">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 rounded-md transition-colors cursor-pointer"
            style={{
              backgroundColor: 'var(--inconspicuous-background-color)',
              color: 'var(--font-color)',
            }}
          >
            キャンセル
          </button>
          <button
            onClick={onSubmit}
            disabled={submitting}
            className="px-4 py-2 text-white rounded-md hover:bg-red-600 transition-colors cursor-pointer"
            style={{
              backgroundColor: 'var(--attention-color)',
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? '送信中...' : '通報する'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
