'use client'

import { useState } from 'react'
import { AccountType } from '@/types/account'
import MediaViewer from '@/components/media_viewer/MediaViewer'

type DrawingsProps = {
  drawings: {
    aid: string
    name: string
    description: string
    image_url: string
    created_at: string
  }[]
  account?: AccountType
}

type ViewerMedia = {
  url: string
  aid?: string
  name?: string
  type: 'image' | 'video' | 'drawing'
}

export default function Drawings({ drawings, account }: DrawingsProps) {
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
      {drawings.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '4px' }}>
          {drawings.map((drawing, index) => (
            <div
              key={drawing.aid}
              style={{ width: '100%', cursor: 'pointer' }}
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
              <img
                src={drawing.image_url}
                alt="drawing"
                style={{
                  width: '100%',
                  height: 'auto',
                  imageRendering: 'pixelated',
                  border: '1px solid',
                  borderImageSource: 'linear-gradient(45deg, hsl(0, 75%, 70%), hsl(60, 75%, 70%), hsl(120, 75%, 70%), hsl(180, 75%, 70%), hsl(240, 75%, 70%), hsl(300, 75%, 70%), hsl(360, 75%, 70%))',
                  borderImageSlice: 1,
                }}
              />
            </div>
          ))}
          {isViewerOpen && <MediaViewer mediaList={viewerMediaList} initialIndex={viewerIndex} isOpen={isViewerOpen} onClose={() => setIsViewerOpen(false)} />}
        </div>
      )}
    </>
  )
}
