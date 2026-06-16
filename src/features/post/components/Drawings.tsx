'use client'

import { useState } from 'react'
import { PostType } from '@/types/post'
import MediaViewer from '@/components/media_viewer/MediaViewer'
import styles from '../styles/Drawings.module.css'

type ViewerMedia = {
  url: string
  aid?: string
  name?: string
  type: 'image' | 'video' | 'drawing'
}

export default function Drawings(post: PostType) {
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const [viewerIndex, setViewerIndex] = useState(0)
  const [viewerMediaList, setViewerMediaList] = useState<ViewerMedia[]>([])

  if (!post.drawings) return null

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
                type: 'drawing',
              })),
            )
          }}
        >
          <img src={drawing.image_url} alt="drawing" className={styles.image} />
        </div>
      ))}
      {isViewerOpen && <MediaViewer mediaList={viewerMediaList} initialIndex={viewerIndex} isOpen={isViewerOpen} onClose={() => setIsViewerOpen(false)} />}
    </div>
  )
}
