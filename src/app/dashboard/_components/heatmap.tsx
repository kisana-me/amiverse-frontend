'use client'

import { useEffect, useRef, useState } from 'react'
import { api } from '@/lib/axios'
import { useCurrentAccount } from '@/providers/CurrentAccountProvider'
import type { HeatmapDay, Heatmap } from '@/providers/CurrentAccountProvider'
import styles from './styles.module.css'

const WEEKDAY_LABELS = ['', '月', '', '水', '', '金', '']

function cellClass(day: HeatmapDay, max: number): string {
  if (day.count <= 0) return day.visited ? `${styles.cell} ${styles.visited}` : styles.cell
  const ratio = max > 0 ? day.count / max : 0
  const level = Math.min(4, Math.max(1, Math.ceil(ratio * 4)))
  return `${styles.cell} ${styles[`level${level}`]}`
}

function chunkWeeks(days: HeatmapDay[]): HeatmapDay[][] {
  const weeks: HeatmapDay[][] = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }
  return weeks
}

// 週ごとに月が変わる最初の列だけ「N月」を返す（目安ラベル）。
function monthLabels(weeks: HeatmapDay[][]): (string | null)[] {
  let prev = ''
  return weeks.map((week) => {
    const first = week[0]
    if (!first) return null
    const month = first.date.slice(5, 7)
    if (month !== prev) {
      prev = month
      return `${Number(month)}月`
    }
    return null
  })
}

export default function Heatmap() {
  const { currentAccount, currentAccountStatus, setCurrentAccount } = useCurrentAccount()
  const [selected, setSelected] = useState<HeatmapDay | null>(null)
  const [failed, setFailed] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const heatmap = currentAccount?.heatmap

  // 必要になった時だけ取得し、provider の account にキャッシュする。
  // 以降はキャッシュ済み（account.heatmap あり）なら再フェッチしない。
  useEffect(() => {
    if (currentAccountStatus !== 'signed_in' || heatmap) return
    let active = true
    api
      .post('/accounts/heatmap')
      .then((res) => {
        if (!active) return
        const data = res.data as Heatmap
        setCurrentAccount((prev) => (prev ? { ...prev, heatmap: data } : prev))
      })
      .catch(() => {
        if (active) setFailed(true)
      })
    return () => {
      active = false
    }
  }, [currentAccountStatus, heatmap, setCurrentAccount])

  // データ描画後、最新（今日＝右端）が見えるよう最初から右スクロール位置にする。
  useEffect(() => {
    if (heatmap && scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth
    }
  }, [heatmap])

  if (currentAccountStatus !== 'signed_in' || failed) return null

  const total = heatmap ? heatmap.days.reduce((sum, day) => sum + day.count, 0) : 0
  const weeks = heatmap ? chunkWeeks(heatmap.days) : []
  const months = monthLabels(weeks)

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.title}>アクティビティ</span>
        {heatmap && <span className={styles.total}>直近1年で {total} 投稿</span>}
      </div>

      <div className={styles.chart}>
        <div className={styles.weekdays}>
          {WEEKDAY_LABELS.map((label, index) => (
            <span key={index} className={styles.weekday}>
              {label}
            </span>
          ))}
        </div>

        <div className={styles.scroll} ref={scrollRef}>
          {heatmap ? (
            <>
              <div className={styles.months}>
                {months.map((label, index) => (
                  <span key={index} className={styles.month}>
                    {label}
                  </span>
                ))}
              </div>

              <div className={styles.grid}>
                {weeks.map((week, wi) => (
                  <div className={styles.col} key={wi}>
                    {week.map((day) => (
                      <div key={day.date} className={cellClass(day, heatmap.max)} title={`${day.date}: ${day.count}投稿${day.visited ? ' / ログイン' : ''}`} onClick={() => setSelected(day)} />
                    ))}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className={styles.months} />
              <div className={styles.grid}>
                {Array.from({ length: 53 }).map((_, wi) => (
                  <div className={styles.col} key={wi}>
                    {Array.from({ length: 7 }).map((_, di) => (
                      <div key={di} className={styles.cell} />
                    ))}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className={styles.legend}>
        <span className={styles.legendLabel}>少</span>
        <span className={`${styles.cell} ${styles.level1}`} />
        <span className={`${styles.cell} ${styles.level2}`} />
        <span className={`${styles.cell} ${styles.level3}`} />
        <span className={`${styles.cell} ${styles.level4}`} />
        <span className={styles.legendLabel}>多</span>
        <span className={styles.legendGap} />
        <span className={`${styles.cell} ${styles.visited}`} />
        <span className={styles.legendLabel}>ログインのみ</span>
        {selected && (
          <span className={styles.selected}>
            {selected.date}・{selected.count}投稿{selected.visited ? '・ログイン' : ''}
          </span>
        )}
      </div>
    </div>
  )
}
