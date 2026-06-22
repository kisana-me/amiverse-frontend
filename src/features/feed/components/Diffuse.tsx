import Link from 'next/link'
import { formatRelativeTime } from '@/lib/format_time'
import { FeedItemType } from '@/types/feed'
import styles from '../styles/Diffuse.module.css'

export default function Diffuse({ diffuse }: { diffuse: FeedItemType | undefined }) {
  if (!diffuse || !diffuse.account) {
    return null
  }

  return (
    <div className={styles.diffuse}>
      <img src={diffuse.account.icon_url || '/ast-imgs/icon.png'} alt="" style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
      <span style={{ fontWeight: 'bold' }}>
        <Link prefetch={false} href={`/@${diffuse.account.name_id}`}>
          {diffuse.account.name}
        </Link>
      </span>
      <span>@{diffuse.account.name_id}</span>

      <div style={{ marginLeft: 'auto' }}>
        {diffuse.created_at && formatRelativeTime(new Date(diffuse.created_at))} 拡散
      </div>
    </div>
  )
}
