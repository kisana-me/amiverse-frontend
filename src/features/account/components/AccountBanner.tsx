'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { AccountType } from '@/types/account'
import styles from '../styles/AccountBanner.module.css'

const MediaViewer = dynamic(() => import('@/components/media_viewer/MediaViewer'), { ssr: false })

type Props = {
  account: AccountType
}

export default function AccountBanner({ account }: Props) {
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const bannerUrl = account.banner_url || '/ast-imgs/banner.png'

  return (
    <div className={styles.banner}>
      <img className={styles.image} src={bannerUrl} alt="バナー" onClick={() => setIsViewerOpen(true)} />
      {isViewerOpen && <MediaViewer mediaList={[{ url: bannerUrl, type: 'image' }]} initialIndex={0} isOpen={isViewerOpen} onClose={() => setIsViewerOpen(false)} />}
    </div>
  )
}
