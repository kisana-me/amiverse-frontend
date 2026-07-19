'use client'

import Link from 'next/link'
import { CommunityType } from '@/types/community'
import { formatDate } from '@/lib/format_time'
import RichText from '@/components/rich_text/RichText'
import styles from '../styles/CommunityProfile.module.css'

type Props = {
  community: CommunityType
}

export default function CommunityProfile({ community }: Props) {
  const founder = community.founder

  return (
    <div className={styles.profile}>
      <div className={styles.summary}>
        <RichText content={community.description || ''} />
      </div>
      <div className={styles.keyvalues}>
        {founder && (
          <div className={styles.keyvalue}>
            <div className={styles.key}>👑創設者</div>
            <Link prefetch={false} href={`/@${founder.name_id}`} className={`${styles.value} ${styles.founder_link}`}>
              <img className={styles.founder_icon} src={founder.icon_url} alt="創設者アイコン" />
              <span>
                {founder.name} @{founder.name_id}
              </span>
            </Link>
          </div>
        )}
        {community.created_at && (
          <div className={styles.keyvalue}>
            <div className={styles.key}>🎫作成日</div>
            <div className={styles.value}>{formatDate(new Date(community.created_at))}</div>
          </div>
        )}
      </div>
      <div className={styles.counters}>
        <div className={styles.counter}>
          <div className={styles.figure}>{community.posts_count ?? 0}</div>
          <div className={styles.subscript}>投稿数</div>
        </div>
      </div>
    </div>
  )
}
