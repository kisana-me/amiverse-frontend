"use client";

import SkeletonBox from '@/components/skeletons/skeleton_box'
import "./page.css"

export default function SkeletonAccount() {
  return (
    <div className="account-container">
      <div className="account-banner-container">
        <SkeletonBox width="100%" height="100%" />
      </div>

      <div className="account-plate">
        <div className="ap-icon-container" style={{ border: 'none', overflow: 'hidden' }}>
           <SkeletonBox width="100%" height="100%" />
        </div>

        <div className="ap-nameplate">
            <div style={{ marginBottom: '4px' }}><SkeletonBox width="150px" height="24px" /></div>
            <div style={{ margin: '0 auto' }}><SkeletonBox width="100px" height="16px" /></div>
        </div>

        <div className="ap-buttons">
            <div style={{ borderRadius: '16px', overflow: 'hidden' }}><SkeletonBox width="40px" height="32px" /></div>
            <div style={{ borderRadius: '16px', overflow: 'hidden' }}><SkeletonBox width="40px" height="32px" /></div>
            <div style={{ borderRadius: '16px', overflow: 'hidden' }}><SkeletonBox width="40px" height="32px" /></div>
            <div style={{ borderRadius: '16px', overflow: 'hidden' }}><SkeletonBox width="80px" height="32px" /></div>
        </div>
      </div>

      <div className="account-profile">
        <div style={{ padding: '0 10px' }}>
            <div style={{ marginBottom: '8px' }}><SkeletonBox width="100%" height="16px" /></div>
            <div style={{ marginBottom: '16px' }}><SkeletonBox width="80%" height="16px" /></div>

            <div className="account-profile-keyvalues">
                <div className="apk-keyvalue">
                    <SkeletonBox width="120px" height="16px" />
                </div>
                <div className="apk-keyvalue">
                    <SkeletonBox width="150px" height="16px" />
                </div>
            </div>
        </div>

        <div className="account-profile-counters">
          <div className="apc-counter">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <SkeletonBox width="40px" height="20px" />
              <SkeletonBox width="60px" height="12px" />
            </div>
          </div>
          <div className="apc-counter">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <SkeletonBox width="40px" height="20px" />
              <SkeletonBox width="60px" height="12px" />
            </div>
          </div>
          <div className="apc-counter">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <SkeletonBox width="40px" height="20px" />
              <SkeletonBox width="60px" height="12px" />
            </div>
          </div>
        </div>
      </div>

      <div className="account-tab">
        <div className="account-tab-selector"><SkeletonBox width="40px" height="16px" /></div>
        <div className="account-tab-selector"><SkeletonBox width="40px" height="16px" /></div>
        <div className="account-tab-selector"><SkeletonBox width="40px" height="16px" /></div>
        <div className="account-tab-selector"><SkeletonBox width="40px" height="16px" /></div>
      </div>
    </div>
  )
}
