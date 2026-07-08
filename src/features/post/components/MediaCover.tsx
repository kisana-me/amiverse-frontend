'use client'

import { useCurrentAccount } from '@/providers/CurrentAccountProvider'
import { RatingType } from '@/types/post'
import { getMediaCoverState } from '@/lib/media_rating'
import styles from '../styles/MediaCover.module.css'

export default function MediaCover({
  rating,
  revealOverride,
  onRevealChange,
}: {
  rating?: RatingType
  revealOverride?: boolean
  onRevealChange: (next: boolean) => void
}) {
  const { currentAccount } = useCurrentAccount()
  const { gated, locked, defaultRevealed } = getMediaCoverState(rating, currentAccount)

  if (!gated) return null

  const revealed = !locked && (revealOverride ?? defaultRevealed)

  if (revealed) {
    return (
      <button
        type="button"
        className={`${styles.toggle} ${rating === 'r18' ? styles.toggle_r18 : ''}`}
        onClick={(e) => {
          e.stopPropagation()
          onRevealChange(false)
        }}
        aria-label="カバーを戻す"
      >
        {rating === 'r18' ? 'R-18' : 'NSFW'}
      </button>
    )
  }

  return (
    <div
      className={styles.cover}
      onClick={(e) => {
        e.stopPropagation()
        if (!locked) onRevealChange(true)
      }}
    >
      <span className={`${styles.label} ${rating === 'r18' ? styles.r18 : ''}`}>{rating === 'r18' ? 'R-18' : 'センシティブ'}</span>
      <span className={styles.hint}>{locked ? '18歳未満は表示できません' : 'タップで表示'}</span>
    </div>
  )
}
