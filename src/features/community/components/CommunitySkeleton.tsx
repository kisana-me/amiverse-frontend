'use client'

import SkeletonLoading from '@/components/skeleton_loading/SkeletonLoading'
import layoutStyles from '../styles/CommunityLayout.module.css'
import bannerStyles from '../styles/CommunityBanner.module.css'
import plateStyles from '../styles/CommunityPlate.module.css'
import profileStyles from '../styles/CommunityProfile.module.css'

export default function CommunitySkeleton() {
  return (
    <div className={layoutStyles.container}>
      <div className={bannerStyles.banner}>
        <SkeletonLoading width="100%" height="100%" padding="0" borderRadius="0" />
      </div>

      <div className={plateStyles.plate}>
        <div className={plateStyles.icon_container} style={{ overflow: 'hidden' }}>
          <SkeletonLoading width="100%" height="100%" padding="0" borderRadius="0" />
        </div>

        <div className={plateStyles.nameplate}>
          <SkeletonLoading width="150px" height="24px" />
        </div>
      </div>

      <div className={profileStyles.profile}>
        <div style={{ padding: '0 10px' }}>
          <div style={{ marginBottom: '8px' }}>
            <SkeletonLoading width="100%" height="16px" />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <SkeletonLoading width="80%" height="16px" />
          </div>
        </div>

        <div className={profileStyles.counters}>
          <div className={profileStyles.counter}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <SkeletonLoading width="40px" height="20px" />
              <SkeletonLoading width="60px" height="12px" />
            </div>
          </div>
        </div>
      </div>

      <div className={layoutStyles.tab}>
        <div className={layoutStyles.tab_selector}>
          <SkeletonLoading width="40px" height="16px" />
        </div>
        <div className={layoutStyles.tab_selector}>
          <SkeletonLoading width="40px" height="16px" />
        </div>
        <div className={layoutStyles.tab_selector}>
          <SkeletonLoading width="40px" height="16px" />
        </div>
        <div className={layoutStyles.tab_selector}>
          <SkeletonLoading width="40px" height="16px" />
        </div>
      </div>
    </div>
  )
}
