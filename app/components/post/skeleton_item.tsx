"use client";

import "./skeleton_item.css"
import SkeletonBox from '@/app/components/skeletons/skeleton_box'

export default function Item() {

  return (
    <>
      <div className="item">
        <SkeletonBox width="100%" height="54px"/>
        <div className='item-info item-top-info'>
          <div className='iti-left'>
            <SkeletonBox width="40px" height="18px"/>
          </div>
          <div className='iti-right'>
            <SkeletonBox width="60px" height="18px"/>
          </div>
        </div>
        <div className="item-content">
          <SkeletonBox width="100%" height="28px"/>
        </div>
        <div className='item-info item-bottom-info'>
          <div className='ibi-left'>
            <SkeletonBox width="60px" height="18px"/>
          </div>
          <div className='ibi-right'>
            <SkeletonBox width="60px" height="18px"/>
          </div>
        </div>
        <SkeletonBox width="80px" height="24px"/>
        <SkeletonBox width="100%" height="26px"/>
      </div>
    </>
  )
}
