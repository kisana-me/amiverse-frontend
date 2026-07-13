"use client";

import "./skeleton_item.css"
import SkeletonLoading from '@/components/skeleton_loading/SkeletonLoading'

export default function Item() {

  return (
    <>
      <div className="item">
        <SkeletonLoading width="100%" height="54px"/>
        <div className='item-info item-top-info'>
          <div className='iti-left'>
            <SkeletonLoading width="40px" height="18px"/>
          </div>
          <div className='iti-right'>
            <SkeletonLoading width="60px" height="18px"/>
          </div>
        </div>
        <div className="item-content">
          <SkeletonLoading width="100%" height="28px"/>
        </div>
        <div className='item-info item-bottom-info'>
          <div className='ibi-left'>
            <SkeletonLoading width="60px" height="18px"/>
          </div>
          <div className='ibi-right'>
            <SkeletonLoading width="60px" height="18px"/>
          </div>
        </div>
        <SkeletonLoading width="80px" height="24px"/>
        <SkeletonLoading width="100%" height="26px"/>
      </div>
    </>
  )
}
