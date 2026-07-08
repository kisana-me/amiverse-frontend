'use client'

import { useState } from 'react'
import { useCurrentAccount } from '@/providers/CurrentAccountProvider'
import { RatingType } from '@/types/post'
import { getMediaCoverState } from '@/lib/media_rating'
import styles from '../styles/SensitiveGate.module.css'

export default function SensitiveGate({ rating, children }: { rating?: RatingType; children: React.ReactNode }) {
  const { currentAccount } = useCurrentAccount()
  const [revealOverride, setRevealOverride] = useState<boolean | undefined>(undefined)

  const { gated, locked, defaultRevealed } = getMediaCoverState(rating, currentAccount)
  const revealed = !locked && (revealOverride ?? defaultRevealed)

  if (!gated || revealed) return <>{children}</>

  return (
    <div
      className={styles.gate}
      onClick={(e) => {
        e.stopPropagation()
        e.preventDefault()
      }}
    >
      <div className={`${styles.label} ${rating === 'r18' ? styles.label_r18 : ''}`}>{rating === 'r18' ? 'R-18' : 'センシティブな内容'}</div>
      <div className={styles.note}>{rating === 'r18' ? '18歳以上向けの内容が含まれます' : '閲覧注意の内容が含まれる可能性があります'}</div>
      {locked ? (
        <div className={styles.note}>18歳未満は表示できません</div>
      ) : (
        <button
          className={styles.button}
          onClick={(e) => {
            e.stopPropagation()
            e.preventDefault()
            setRevealOverride(true)
          }}
        >
          表示する
        </button>
      )}
    </div>
  )
}
