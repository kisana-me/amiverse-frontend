'use client'

import { useState } from 'react'
import './Media.css'
import { PostType } from '@/types/post'
import MediaViewer from '@/components/media_viewer/MediaViewer'

type ViewerMedia = {
  url: string
  aid?: string
  name?: string
  type: 'image' | 'video' | 'drawing'
}

export default function Media(post: PostType) {
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const [viewerIndex, setViewerIndex] = useState(0)
  const [viewerMediaList, setViewerMediaList] = useState<ViewerMedia[]>([])

  const openViewer = (index: number, list: ViewerMedia[]) => {
    setViewerMediaList(list)
    setViewerIndex(index)
    setIsViewerOpen(true)
  }

  return (
    <>
      {post.media && post.media.length > 0 && (
        <div className={`post-media post-media-${Math.min(post.media.length, 9)}`}>
          {post.media.map((media, index) => (
            <div
              key={media.aid}
              className="post-media-wrapper"
              onClick={(e) => {
                e.stopPropagation()
                openViewer(index, post.media!)
              }}
            >
              {media.type === 'image' ? <img src={media.url} className="post-media-image" alt={media.name || 'media'} /> : <video src={media.url} className="post-media-video" />}
            </div>
          ))}
          {isViewerOpen && <MediaViewer mediaList={viewerMediaList} initialIndex={viewerIndex} isOpen={isViewerOpen} onClose={() => setIsViewerOpen(false)} />}
        </div>
      )}
    </>
  )
}
