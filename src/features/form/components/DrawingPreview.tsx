'use client'

import { useState } from 'react'
import Drawings from '@/features/post/components/Drawings'
import { PostType } from '@/types/post'
import { DrawingData } from '../api/posts'
import DetailModal from './DetailModal'
import styles from '../styles/DrawingPreview.module.css'

const MenuIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="5" cy="12" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="19" cy="12" r="2" />
  </svg>
)

type Props = {
  drawing: DrawingData
  disabled: boolean
  onUpdate: (patch: Partial<DrawingData>) => void
  onRemove: () => void
}

export default function DrawingPreview({ drawing, disabled, onUpdate, onRemove }: Props) {
  const [editing, setEditing] = useState(false)

  const syntheticPost = {
    drawings: [{ aid: 'local-drawing', name: drawing.name, description: drawing.description, image_url: drawing.previewUrl, rating: drawing.rating, created_at: new Date().toISOString() }],
  } as unknown as PostType

  return (
    <div className={styles.wrap}>
      <Drawings post={syntheticPost} />
      <button type="button" className={styles.remove_button} onClick={onRemove} disabled={disabled} aria-label="お絵描きを削除">
        ×
      </button>
      <button type="button" className={styles.menu_button} onClick={() => setEditing(true)} disabled={disabled} aria-label="お絵描きの詳細を編集">
        <MenuIcon />
      </button>
      <DetailModal isOpen={editing} onClose={() => setEditing(false)} title="お絵描きの詳細" name={drawing.name} description={drawing.description} rating={drawing.rating} onChange={onUpdate} />
    </div>
  )
}
