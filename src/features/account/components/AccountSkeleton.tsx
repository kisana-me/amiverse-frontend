'use client'

import SkeletonLoading from '@/components/skeleton_loading/SkeletonLoading'
import layoutStyles from '../styles/AccountLayout.module.css'
import bannerStyles from '../styles/AccountBanner.module.css'
import plateStyles from '../styles/AccountPlate.module.css'
import profileStyles from '../styles/AccountProfile.module.css'

export default function AccountSkeleton() {
  return (
    <div className={layoutStyles.container}>
      <div className={bannerStyles.banner}>
        <SkeletonLoading width="100%" height="100%" padding="0" borderRadius="0" />
      </div>

      <div className={plateStyles.plate}>
        <div className={plateStyles.icon_container} style={{ border: 'none', overflow: 'hidden' }}>
          <SkeletonLoading width="100%" height="100%" padding="0" borderRadius="0" />
        </div>

        <div className={plateStyles.nameplate}>
          <div style={{ marginBottom: '4px' }}>
            <SkeletonLoading width="150px" height="24px" />
          </div>
          <div style={{ margin: '0 auto' }}>
            <SkeletonLoading width="100px" height="16px" />
          </div>
        </div>

        <div className={plateStyles.buttons}>
          <div style={{ borderRadius: '16px', overflow: 'hidden' }}>
            <SkeletonLoading width="40px" height="32px" />
          </div>
          <div style={{ borderRadius: '16px', overflow: 'hidden' }}>
            <SkeletonLoading width="40px" height="32px" />
          </div>
          <div style={{ borderRadius: '16px', overflow: 'hidden' }}>
            <SkeletonLoading width="40px" height="32px" />
          </div>
          <div style={{ borderRadius: '16px', overflow: 'hidden' }}>
            <SkeletonLoading width="80px" height="32px" />
          </div>
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

          <div className={profileStyles.keyvalues}>
            <div className={profileStyles.keyvalue}>
              <SkeletonLoading width="120px" height="16px" />
            </div>
            <div className={profileStyles.keyvalue}>
              <SkeletonLoading width="150px" height="16px" />
            </div>
          </div>
        </div>

        <div className={profileStyles.counters}>
          <div className={profileStyles.counter}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <SkeletonLoading width="40px" height="20px" />
              <SkeletonLoading width="60px" height="12px" />
            </div>
          </div>
          <div className={profileStyles.counter}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <SkeletonLoading width="40px" height="20px" />
              <SkeletonLoading width="60px" height="12px" />
            </div>
          </div>
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
