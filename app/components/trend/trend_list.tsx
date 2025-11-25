import { useEffect } from 'react'
import Link from 'next/link'
import { formatRelativeTime } from '@/app/lib/format_time'
import { TrendType } from '@/types/trend'
import './style.css'

export default function TrendList(trend: TrendType) {

  useEffect(() => {
  }, [])

  return (
    <>
      <div className="trend">
        <div className="trend-top">
          <div className="trend-top-image">
            <img src={trend.image_url} alt={trend.title} />
          </div>
          <div className="trend-top-content">
            <div className="trend-top-title">{trend.title}</div>
            <div className="trend-top-overview">{trend.overview}</div>
          </div>
        </div>

        <div className="trend-list">
          {trend.ranking.map((t, index) => (
            <Link href={`/search?query=${t.word}`} className="trend-item" key={index}>
              <div className="trend-item-top">{index + 1}位</div>
              <div className="trend-item-word">{t.word}</div>
              <div className="trend-item-bottom">{t.count}件</div>
            </Link>
          ))}
        </div>

        <div className="trend-bottom">
          <span>Category: {trend.category || 'general'}</span><br />
          <span>Last updated at: {formatRelativeTime(trend.last_updated_at)}</span>
        </div>
      </div>
    </>
  )
}
