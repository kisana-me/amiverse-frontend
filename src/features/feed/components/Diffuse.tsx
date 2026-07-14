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
      <Link prefetch={false} href={`/@${diffuse.account.name_id}`} className={styles.icon}>
        <img src={diffuse.account.icon_url || '/ast-imgs/icon.png'} alt="拡散者のアイコン" />
      </Link>
      <Link prefetch={false} href={`/@${diffuse.account.name_id}`} className={styles.name}>
        {diffuse.account.name}
      </Link>
      <Link prefetch={false} href={`/@${diffuse.account.name_id}`}>
        @{diffuse.account.name_id}
      </Link>
      <div>
        {diffuse.created_at && formatRelativeTime(new Date(diffuse.created_at))} 拡散
      </div>
    </div>
  )
}
