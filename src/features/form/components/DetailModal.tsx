'use client'

import { Modal } from '@/components/modal/Modal'
import { FormRating } from '../api/posts'
import styles from '../styles/DetailModal.module.css'

const ratingOptions: { value: FormRating; label: string }[] = [
  { value: 'general', label: '全年齢' },
  { value: 'nsfw', label: 'センシティブ' },
  { value: 'r18', label: 'R-18' },
]

type Props = {
  isOpen: boolean
  onClose: () => void
  title?: string
  name: string
  description: string
  rating: FormRating
  onChange: (patch: { name?: string; description?: string; rating?: FormRating }) => void
}

export default function DetailModal({ isOpen, onClose, title = 'メディアの詳細', name, description, rating, onChange }: Props) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className={styles.form}>
        <label className={styles.field}>
          <span className={styles.label}>名前</span>
          <input type="text" className={styles.input} placeholder="名前(任意)" maxLength={50} value={name} onChange={(e) => onChange({ name: e.target.value })} />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>説明</span>
          <textarea className={styles.input} placeholder="説明(任意)" maxLength={500} value={description} onChange={(e) => onChange({ description: e.target.value })} />
        </label>
        <div className={styles.field}>
          <span className={styles.label}>レーティング</span>
          <div className={styles.rating_group}>
            {ratingOptions.map((option) => (
              <button
                type="button"
                key={option.value}
                className={`${styles.rating_button} ${rating === option.value ? styles.rating_button_active : ''}`}
                onClick={() => onChange({ rating: option.value })}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  )
}
