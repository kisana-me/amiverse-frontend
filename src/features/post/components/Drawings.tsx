'use client'

import { useState } from 'react'
import { PostType, RatingType } from '@/types/post'
import MediaViewer from '@/components/media_viewer/MediaViewer'
import MediaCover from './MediaCover'
import { useMediaReveal } from '../hooks/useMediaReveal'
import styles from '../styles/Drawings.module.css'

type ViewerMedia = {
  url: string | null
  aid?: string
  name?: string
  rating?: RatingType
  type: 'image' | 'video' | 'drawing'
}

export default function Drawings({ post }: { post: PostType }) {
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const [viewerIndex, setViewerIndex] = useState(0)
  const [viewerMediaList, setViewerMediaList] = useState<ViewerMedia[]>([])
  const { revealOverrides, setReveal } = useMediaReveal()

  if (!post.drawings || post.drawings.length === 0) return null

  const { drawings } = post

  const openViewer = (index: number, list: ViewerMedia[]) => {
    setViewerMediaList(list)
    setViewerIndex(index)
    setIsViewerOpen(true)
  }

  return (
    <div className={styles.images}>
      {drawings.map((drawing, index) => (
        <div
          key={drawing.aid}
          className={styles.image_container}
          onClick={(e) => {
            e.stopPropagation()
            openViewer(
              index,
              drawings!.map((d) => ({
                url: d.image_url,
                aid: d.aid,
                name: d.name,
                rating: d.rating,
                type: 'drawing',
              })),
            )
          }}
        >
          <img src={drawing.image_url ?? undefined} alt="drawing" className={styles.image} />
          <MediaCover rating={drawing.rating} revealOverride={revealOverrides.get(drawing.aid)} onRevealChange={(next) => setReveal(drawing.aid, next)} />
        </div>
      ))}
      {isViewerOpen && (
        <MediaViewer mediaList={viewerMediaList} initialIndex={viewerIndex} isOpen={isViewerOpen} onClose={() => setIsViewerOpen(false)} revealOverrides={revealOverrides} onRevealChange={setReveal} />
      )}
    </div>
  )
}
