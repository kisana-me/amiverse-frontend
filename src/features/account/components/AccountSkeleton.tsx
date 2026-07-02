'use client'

import SkeletonBox from '@/components/skeletons/skeleton_box'
import layoutStyles from '../styles/AccountLayout.module.css'
import bannerStyles from '../styles/AccountBanner.module.css'
import plateStyles from '../styles/AccountPlate.module.css'
import profileStyles from '../styles/AccountProfile.module.css'

export default function AccountSkeleton() {
  return (
    <div className={layoutStyles.container}>
      <div className={bannerStyles.banner}>
        <SkeletonBox width="100%" height="100%" />
      </div>

      <div className={plateStyles.plate}>
        <div className={plateStyles.icon_container} style={{ border: 'none', overflow: 'hidden' }}>
          <SkeletonBox width="100%" height="100%" />
        </div>

        <div className={plateStyles.nameplate}>
          <div style={{ marginBottom: '4px' }}>
            <SkeletonBox width="150px" height="24px" />
          </div>
          <div style={{ margin: '0 auto' }}>
            <SkeletonBox width="100px" height="16px" />
          </div>
        </div>

        <div className={plateStyles.buttons}>
          <div style={{ borderRadius: '16px', overflow: 'hidden' }}>
            <SkeletonBox width="40px" height="32px" />
          </div>
          <div style={{ borderRadius: '16px', overflow: 'hidden' }}>
            <SkeletonBox width="40px" height="32px" />
          </div>
          <div style={{ borderRadius: '16px', overflow: 'hidden' }}>
            <SkeletonBox width="40px" height="32px" />
          </div>
          <div style={{ borderRadius: '16px', overflow: 'hidden' }}>
            <SkeletonBox width="80px" height="32px" />
          </div>
        </div>
      </div>

      <div className={profileStyles.profile}>
        <div style={{ padding: '0 10px' }}>
          <div style={{ marginBottom: '8px' }}>
            <SkeletonBox width="100%" height="16px" />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <SkeletonBox width="80%" height="16px" />
          </div>

          <div className={profileStyles.keyvalues}>
            <div className={profileStyles.keyvalue}>
              <SkeletonBox width="120px" height="16px" />
            </div>
            <div className={profileStyles.keyvalue}>
              <SkeletonBox width="150px" height="16px" />
            </div>
          </div>
        </div>

        <div className={profileStyles.counters}>
          <div className={profileStyles.counter}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <SkeletonBox width="40px" height="20px" />
              <SkeletonBox width="60px" height="12px" />
            </div>
          </div>
          <div className={profileStyles.counter}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <SkeletonBox width="40px" height="20px" />
              <SkeletonBox width="60px" height="12px" />
            </div>
          </div>
          <div className={profileStyles.counter}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <SkeletonBox width="40px" height="20px" />
              <SkeletonBox width="60px" height="12px" />
            </div>
          </div>
        </div>
      </div>

      <div className={layoutStyles.tab}>
        <div className={layoutStyles.tab_selector}>
          <SkeletonBox width="40px" height="16px" />
        </div>
        <div className={layoutStyles.tab_selector}>
          <SkeletonBox width="40px" height="16px" />
        </div>
        <div className={layoutStyles.tab_selector}>
          <SkeletonBox width="40px" height="16px" />
        </div>
        <div className={layoutStyles.tab_selector}>
          <SkeletonBox width="40px" height="16px" />
        </div>
      </div>
    </div>
  )
}
