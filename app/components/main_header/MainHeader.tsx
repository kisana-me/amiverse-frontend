"use client";

import Link from 'next/link'
import "./style.css"
import Image from 'next/image'
import { useOverlay } from '@/app/providers/OverlayProvider'

export default function MainHeader({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { headerMenuTrigger, asideMenuTrigger } = useOverlay()

  return (
    <div className="main-header">
      <div className="main-header-button-1">
        <button onClick={() => {headerMenuTrigger()}}>
          <Image
            src="https://kisana.me/images/amiverse/amiverse-logo.png"
            alt="Amiverseのロゴ"
            width={40}
            height={40}
          />
        </button>
      </div>
      <div className="main-header-content">
        {children}
      </div>
      <div className="main-header-button-2">
        <button onClick={() => {asideMenuTrigger()}}>
          ☰
        </button>
      </div>
    </div>
  )
}
