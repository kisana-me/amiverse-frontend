'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import styles from './style.module.css'

// この距離まで引っ張って離すと更新が発火する（style.module.css の .indicator の高さと合わせる）
const PULL_THRESHOLD = 64
// 指の移動距離に対する追従率（抵抗感）
const PULL_RESISTANCE = 0.5
// これ以上は引っ張れない
const MAX_PULL = 128

type PullToRefreshProps = {
  /** 更新処理。進行状態は refreshing プロパティで伝える */
  onRefresh: () => void
  /** 更新中フラグ。true の間はインジケーターを開いたままスピナーを回す */
  refreshing: boolean
  /** プル操作を無効化（初回ロード中など） */
  disabled?: boolean
  children: ReactNode
}

/**
 * Pull-to-Refresh コンポーネント
 *
 * タッチデバイスでページ最上部からコンテンツを下に引っ張ると更新を発火する。
 * プル中はコンテンツが指に追従して下がり、しきい値を超えて離すと onRefresh を呼ぶ。
 * refreshing が true の間はインジケーター分だけ開いたままスピナーを表示する。
 *
 * 方向判定は TabContent の横スワイプと同じ 8px 基準で行い、
 * 横ジェスチャー（タブ切替）には関与しない。
 */
export default function PullToRefresh({ onRefresh, refreshing, disabled = false, children }: PullToRefreshProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [pullDistance, setPullDistance] = useState(0)
  const [isPulling, setIsPulling] = useState(false)

  // タッチイベントハンドラから最新値を参照するための同期
  const pullDistanceRef = useRef(0)
  const isPullingRef = useRef(false)
  const refreshingRef = useRef(refreshing)
  const disabledRef = useRef(disabled)
  const onRefreshRef = useRef(onRefresh)

  useEffect(() => {
    refreshingRef.current = refreshing
    disabledRef.current = disabled
    onRefreshRef.current = onRefresh
  })

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const touch = {
      startX: 0,
      startY: 0,
      directionDecided: false,
      isVertical: false,
      pullStartY: 0,
    }

    const handleTouchStart = (e: TouchEvent) => {
      const t = e.touches[0]
      touch.startX = t.clientX
      touch.startY = t.clientY
      touch.directionDecided = false
      touch.isVertical = false
    }

    const handleTouchMove = (e: TouchEvent) => {
      const t = e.touches[0]
      const dx = t.clientX - touch.startX
      const dy = t.clientY - touch.startY

      if (!touch.directionDecided) {
        if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
          touch.directionDecided = true
          touch.isVertical = Math.abs(dy) >= Math.abs(dx)
        }
        return
      }

      if (!touch.isVertical) return

      if (!isPullingRef.current) {
        if (document.querySelector('dialog[open]')) return

        // ページ最上部で下方向に引いたときだけプルを開始する。
        // スクロール途中から最上部に戻ってきた場合もここで拾う
        if (dy > 0 && window.scrollY <= 0 && !disabledRef.current && !refreshingRef.current) {
          isPullingRef.current = true
          touch.pullStartY = t.clientY
          setIsPulling(true)
        }
        return
      }

      // プル中はネイティブのスクロール／オーバースクロールを止めて指に追従させる
      e.preventDefault()
      const pull = (t.clientY - touch.pullStartY) * PULL_RESISTANCE
      const distance = Math.min(Math.max(pull, 0), MAX_PULL)
      pullDistanceRef.current = distance
      setPullDistance(distance)
    }

    const finishPull = () => {
      if (!isPullingRef.current) return
      const shouldRefresh = pullDistanceRef.current >= PULL_THRESHOLD
      isPullingRef.current = false
      pullDistanceRef.current = 0
      setIsPulling(false)
      setPullDistance(0)
      // onRefresh が refreshing を true にすれば開いたまま、
      // しなければそのまま閉じるアニメーションになる
      if (shouldRefresh) onRefreshRef.current()
    }

    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', finishPull, { passive: true })
    container.addEventListener('touchcancel', finishPull, { passive: true })

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', finishPull)
      container.removeEventListener('touchcancel', finishPull)
    }
  }, [])

  const offset = isPulling ? pullDistance : refreshing ? PULL_THRESHOLD : 0
  const progress = Math.min(pullDistance / PULL_THRESHOLD, 1)

  return (
    <div ref={containerRef} className={styles.container}>
      <div
        className={`${styles.track}${!isPulling ? ` ${styles.track_settling}` : ''}`}
        style={{ transform: `translateY(${offset}px)` }}
      >
        <div className={styles.indicator}>
          <div
            className={`${styles.spinner}${refreshing ? ` ${styles.spinner_spinning}` : ''}`}
            style={!refreshing ? { opacity: progress, transform: `rotate(${progress * 270}deg)` } : undefined}
          />
        </div>
        {children}
      </div>
    </div>
  )
}
