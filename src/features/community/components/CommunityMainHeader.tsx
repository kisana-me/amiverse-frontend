'use client'

import { CommunityType } from '@/types/community'
import styles from '../styles/CommunityMainHeader.module.css'

type Props = {
  community: CommunityType
}

export default function CommunityMainHeader({ community }: Props) {
  return (
    <div className={styles.header}>
      <div className={styles.icon_wrap}>
        <img src={community.icon_url} className={styles.icon} alt="アイコン" />
      </div>
      <div className={styles.nameplate}>
        <div className={styles.name}>{community.name}</div>
      </div>
    </div>
  )
}
