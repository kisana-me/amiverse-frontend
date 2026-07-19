'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { CommunityType } from '@/types/community'
import styles from '../styles/CommunityPlate.module.css'

const MediaViewer = dynamic(() => import('@/components/media_viewer/MediaViewer'), { ssr: false })

type Props = {
  community: CommunityType
}

export default function CommunityPlate({ community }: Props) {
  const [isIconViewerOpen, setIsIconViewerOpen] = useState(false)
  const iconUrl = community.icon_url || '/ast-imgs/icon.png'

  return (
    <div className={styles.plate}>
      <div className={styles.icon_container} onClick={() => setIsIconViewerOpen(true)}>
        <img className={styles.icon_image} src={iconUrl} alt="アイコン" />
      </div>

      {isIconViewerOpen && <MediaViewer mediaList={[{ url: iconUrl, type: 'image' }]} initialIndex={0} isOpen={isIconViewerOpen} onClose={() => setIsIconViewerOpen(false)} />}

      <div className={styles.nameplate}>
        <div className={styles.name}>{community.name}</div>
      </div>
    </div>
  )
}
