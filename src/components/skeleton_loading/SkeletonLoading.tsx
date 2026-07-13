'use client'

import styles from './styles.module.css'

type SkeletonLoadingProps = {
  width?: string
  height?: string
  padding?: string
  borderRadius?: string
}

export default function SkeletonLoading({ width = '100px', height = '24px', padding = '4px', borderRadius = '4px' }: SkeletonLoadingProps) {
  return (
    <div className={styles.outside} style={{ width, height, padding }}>
      <div className={styles.inside} style={{ borderRadius }} />
    </div>
  )
}
