"use client";

import Image from "next/image"
import Link from "next/link"
import type { ReactNode } from "react"
import "./OneLine.css"
import { AccountType } from "@/types/account"

type OneLineProps = {
  account: AccountType
  children?: ReactNode
}

export default function OneLine(props: OneLineProps) {
  const { account, children } = props

  return (
    <>
      <div className="ol-account">
        <Link className="ol-plate" href={'/@' + account.name_id}>
          <div className="ol-ring" style={{
            borderColor: account.ring_color || '#fff0'
          }}>
            <div className="ol-status" style={{
              bottom: 0,
              right: 0,
              background: account.status_rb_color || '#fff0'
            }}>
            </div>
            <Image
              src={account.icon_url || "/ast-imgs/icon.png"}
              className="ol-icon"
              alt={account.name || ""}
              width={42}
              height={42}
              unoptimized
            />
          </div>
          <div className="ol-nameplate">
            <div className="ol-name">
              {account.name}
            </div>
            <div className="ol-nameplate-under">
              <div className="ol-name_id">
                {'@' + account.name_id}
              </div>
            </div>
          </div>
        </Link>
        <div className="ol-others">
          {children}
        </div>
      </div>
    </>
  )
}
