'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { RatingType } from '@/types/post'
import { useMediaReveal } from '@/features/post/hooks/useMediaReveal'
import { MediaItem } from '../api/posts'
import DetailModal from './DetailModal'
import styles from '../styles/MediaList.module.css'

const MediaViewer = dynamic(() => import('@/components/media_viewer/MediaViewer'), { ssr: false })

type ViewerMedia = {
  url: string
  aid?: string
  name?: string
  rating?: RatingType
  type: 'image' | 'video' | 'drawing'
}

const MenuIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="5" cy="12" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="19" cy="12" r="2" />
  </svg>
)

type Props = {
  mediaItems: MediaItem[]
  disabled: boolean
  onUpdateMedia: (index: number, patch: Partial<MediaItem>) => void
  onRemoveMedia: (index: number) => void
}

export default function MediaList({ mediaItems, disabled, onUpdateMedia, onRemoveMedia }: Props) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const [viewerIndex, setViewerIndex] = useState(0)
  const { revealOverrides, setReveal } = useMediaReveal()

  if (mediaItems.length === 0) return null

  const editing = editingIndex !== null ? mediaItems[editingIndex] : null

  const viewerList: ViewerMedia[] = mediaItems.map((item, index) => ({
    url: item.url,
    aid: 'local-media-' + index,
    name: item.name,
    rating: item.rating,
    type: item.file.type.startsWith('video') ? 'video' : 'image',
  }))

  const openViewer = (index: number) => {
    setViewerIndex(index)
    setIsViewerOpen(true)
  }

  return (
    <div className={styles.media_list}>
      {mediaItems.map((item, index) => (
        <div key={item.url} className={styles.item}>
          {item.file.type.startsWith('video') ? (
            <video className={styles.thumb} src={item.url} onClick={() => openViewer(index)} />
          ) : (
            <img className={styles.thumb} src={item.url} alt="preview" onClick={() => openViewer(index)} />
          )}
          <button type="button" className={styles.remove_button} onClick={() => onRemoveMedia(index)} disabled={disabled} aria-label="添付を削除">
            ×
          </button>
          <button type="button" className={styles.menu_button} onClick={() => setEditingIndex(index)} disabled={disabled} aria-label="メディアの詳細を編集">
            <MenuIcon />
          </button>
        </div>
      ))}

      <DetailModal
        isOpen={editing !== null}
        onClose={() => setEditingIndex(null)}
        name={editing?.name || ''}
        description={editing?.description || ''}
        rating={editing?.rating || 'general'}
        onChange={(patch) => editingIndex !== null && onUpdateMedia(editingIndex, patch)}
      />

      {isViewerOpen && (
        <MediaViewer mediaList={viewerList} initialIndex={viewerIndex} isOpen={isViewerOpen} onClose={() => setIsViewerOpen(false)} revealOverrides={revealOverrides} onRevealChange={setReveal} />
      )}
    </div>
  )
}
