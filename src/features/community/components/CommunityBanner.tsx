'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { CommunityType } from '@/types/community'
import styles from '../styles/CommunityBanner.module.css'

const MediaViewer = dynamic(() => import('@/components/media_viewer/MediaViewer'), { ssr: false })

type Props = {
  community: CommunityType
}

export default function CommunityBanner({ community }: Props) {
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const bannerUrl = community.banner_url || '/ast-imgs/banner.png'

  return (
    <div className={styles.banner}>
      <img className={styles.image} src={bannerUrl} alt="バナー" onClick={() => setIsViewerOpen(true)} />
      {isViewerOpen && <MediaViewer mediaList={[{ url: bannerUrl, type: 'image' }]} initialIndex={0} isOpen={isViewerOpen} onClose={() => setIsViewerOpen(false)} />}
    </div>
  )
}
