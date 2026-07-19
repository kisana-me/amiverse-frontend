import styles from './styles.module.css'
import SkeletonLoading from '@/components/skeleton_loading/SkeletonLoading'

export default function SkeletonTrend() {
  return (
    <div className={styles.trend}>
      <div className={styles.top}>
        <div className={styles.top_media}>
          <SkeletonLoading width='100%' height='100%' padding='0' borderRadius='0' />
        </div>
        <div className={styles.top_content}>
          <div className={styles.top_title}><SkeletonLoading /></div>
          <div className={styles.top_overview}><SkeletonLoading width="200px"/></div>
        </div>
      </div>

      <div className={styles.list}>
        {[...Array(30)].map((_, index) => (
          <div key={index} className={styles.link}>
            <div className={styles.link_top}><SkeletonLoading width="80px" height="20px"/></div>
            <div className={styles.link_word}><SkeletonLoading width="50px" /></div>
            <div className={styles.link_bottom}><SkeletonLoading height="20px" /></div>
          </div>
        ))}
      </div>

      <div className={styles.bottom}>
        <span>カテゴリ: <SkeletonLoading width="60px" height="20px"/></span><br />
        <span>最終更新: <SkeletonLoading width="180px" height="20px"/></span>
      </div>
    </div>
  )
}
