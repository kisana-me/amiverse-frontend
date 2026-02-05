"use client";

import "./style.css"
import { useOverlay } from '@/app/providers/OverlayProvider'

export default function MainHeader() {
  const { menuOverlay, closeMenu } = useOverlay()

  return (
    <>
      {false && <div className="global-overlay" />}
      {menuOverlay && <div className="global-menu-overlay" onClick={()=>{closeMenu()}} />}
    </>
  )
}
