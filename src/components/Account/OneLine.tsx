"use client";

import Image from "next/image"
import Link from "next/link"
import type { ReactNode } from "react"
import "./OneLine.css"
import { AccountType } from "@/types/account"

type OneLineProps = {
  account: AccountType
  classes?: string
  children?: ReactNode
}

export default function OneLine(props: OneLineProps) {
  const { account, children, classes } = props

  return (
    <>
      <div className={`aol ${classes || ""}`}>
        <Link className="aol-plate" href={'/@' + account.name_id}>
          <div className="aol-ring" style={{
            borderColor: account.ring_color || '#fff0'
          }}>
            <div className="aol-status" style={{
              bottom: 0,
              right: 0,
              background: account.status_rb_color || '#fff0'
            }}>
            </div>
            <Image
              src={account.icon_url || "/ast-imgs/icon.png"}
              className="aol-icon"
              alt={account.name || ""}
              width={42}
              height={42}
              unoptimized
            />
          </div>
          <div className="aol-nameplate">
            <div className="aol-name">
              {account.name}
            </div>
            <div className="aol-nameplate-under">
              <div className="aol-name_id">
                {'@' + account.name_id}
              </div>
            </div>
          </div>
        </Link>
        <div className="aol-others">
          {children}
        </div>
      </div>
    </>
  )
}
