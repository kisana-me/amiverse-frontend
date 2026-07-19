import Link from 'next/link'
import { formatRelativeTime } from '@/lib/format_time'
import { TrendType } from '@/types/trend'
import styles from './styles.module.css'

export default function Trend(trend: TrendType) {
  return (
    <div className={styles.trend}>
      <div className={styles.top}>
        <div className={styles.top_media}>
          <img src={trend.image_url} alt={trend.title} />
        </div>
        <div className={styles.top_content}>
          <div className={styles.top_title}>{trend.title}</div>
          <div className={styles.top_overview}>{trend.overview}</div>
        </div>
      </div>

      <div className={styles.list}>
        {trend.ranking.map((t, index) => (
          <Link prefetch={false} href={`/search?query=${t.word}`} className={styles.link} key={index}>
            <div className={styles.link_top}>{index + 1}位</div>
            <div className={styles.link_word}>{t.word}</div>
            <div className={styles.link_bottom}>{t.count}件</div>
          </Link>
        ))}
      </div>

      <div className={styles.bottom}>
        <span>カテゴリ: {trend.category || '一般'}</span><br />
        <span>最終更新: {formatRelativeTime(trend.last_updated_at)}</span>
      </div>
    </div>
  )
}
