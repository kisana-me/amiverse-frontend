"use client"

import './style.css'
import SkeletonBox from '@/components/skeletons/skeleton_box'

export default function SkeletonTrendList() {

  return (
    <>
      <div className="trend">
        <div className="trend-top">
          <div className="trend-top-content">
            <div className="trend-top-title"><SkeletonBox /></div>
            <div className="trend-top-summary"><SkeletonBox width="200px"/></div>
          </div>
        </div>

        <div className="trend-list">
          {[...Array(30)].map((_, index) => (
            <div key={index} className="trend-item">
              <div className="trend-item-top"><SkeletonBox width="80px" height="20px"/></div>
              <div className="trend-item-word"><SkeletonBox width="50px" /></div>
              <div className="trend-item-bottom"><SkeletonBox height="20px" /></div>
            </div>
          ))}
        </div>

        <div className="trend-bottom">
          <span>Category: <SkeletonBox width="60px" height="20px"/></span><br />
          <span>Last updated at: <SkeletonBox width="180px" height="20px"/></span>
        </div>
      </div>
    </>
  )
}
