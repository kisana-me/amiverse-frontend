"use client"

import './style.css'
import SkeletonLoading from '@/components/skeleton_loading/SkeletonLoading'

export default function SkeletonTrendList() {

  return (
    <>
      <div className="trend">
        <div className="trend-top">
          <div className="trend-top-content">
            <div className="trend-top-title"><SkeletonLoading /></div>
            <div className="trend-top-summary"><SkeletonLoading width="200px"/></div>
          </div>
        </div>

        <div className="trend-list">
          {[...Array(30)].map((_, index) => (
            <div key={index} className="trend-item">
              <div className="trend-item-top"><SkeletonLoading width="80px" height="20px"/></div>
              <div className="trend-item-word"><SkeletonLoading width="50px" /></div>
              <div className="trend-item-bottom"><SkeletonLoading height="20px" /></div>
            </div>
          ))}
        </div>

        <div className="trend-bottom">
          <span>Category: <SkeletonLoading width="60px" height="20px"/></span><br />
          <span>Last updated at: <SkeletonLoading width="180px" height="20px"/></span>
        </div>
      </div>
    </>
  )
}
