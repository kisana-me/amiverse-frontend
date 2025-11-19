"use client";

import "./style.css";
import React, { useState, useEffect } from 'react'
import { useOverlay } from '@/app/providers/OverlayProvider'

export default function InitialLoading() {
  const { initOverlay, doneInitLoading } = useOverlay()
  const [showInitOverlay, setShowInitOverlay] = useState(initOverlay.is_loading)

  useEffect(() => {
    if (!initOverlay.is_loading) {
      const timer = setTimeout(() => {
        setShowInitOverlay(false)
      }, 390)
      return () => clearTimeout(timer)
    }
  }, [initOverlay])

  return (
    <div className={`${showInitOverlay ? 'show-loading' : 'hide-loading'}`}>
      <div className='loading-logo-wrap'>
        <div className={`loading-logo-ring1 ${initOverlay ? '' : 'loading-logo-ring2'}`}></div>
        <img className='loading-logo' src='https://kisana.me/images/amiverse/amiverse-logo.png' />
      </div>
      <div className='loading-details'>
        <div className='loading-message'>{initOverlay.loading_message} / {initOverlay.loading_progress}%</div>
        <div className='loading-close-button' onClick={() => doneInitLoading()} >閉じる</div>
      </div>
    </div>
  )
}
