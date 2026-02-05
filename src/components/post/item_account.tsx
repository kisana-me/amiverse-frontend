"use client";

import Link from "next/link"
import "./item_account.css"
import { PostType } from "@/types/post"

export default function ItemAccount(post: PostType) {
  const account = post.account;

  return (
    <>
      <div className="item-account-info">
        <Link href={'/@' + account.name_id} className="iai-plate" style={{
          color: 'inherit',
          textDecoration: 'none',
          minWidth: 0,
          display: 'flex',
          flexGrow: 1
        }}>
          <div className="iai-icon-wrap" style={{
            borderColor: account.ring_color || '#fff0'
          }}>
            <div className="iai-status" style={{
              bottom: 0,
              right: 0,
              background: account.status_rb_color || '#fff0'
            }}>
            </div>
              <img src={account.icon_url || "/ast-imgs/icon.png"} className="iai-icon" />
          </div>
          <div className="iai-nameplate">
            <div className="iai-name">
              {account.name}
            </div>
            <div className="iai-nameplate-under">
              <div className="iai-name_id">
                {'@' + account.name_id}
              </div>
            </div>
          </div>
        </Link>
        <div className="iai-others">
        {/* <button className="iai-button" onClick={()=>console.log("button clicked!")}>フォロー</button> */}
        </div>
      </div>
    </>
  )
}
