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
      <img src={diffuse.account.icon_url || '/ast-imgs/icon.png'} alt="" className={styles.icon} />
      <Link prefetch={false} href={`/@${diffuse.account.name_id}`} style={{ fontWeight: 'bold' }}>
        {diffuse.account.name}
      </Link>
      <span>@{diffuse.account.name_id}</span>
      <div>
        {diffuse.created_at && formatRelativeTime(new Date(diffuse.created_at))} 拡散
      </div>
    </div>
  )
}
