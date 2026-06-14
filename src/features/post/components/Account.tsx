'use client'

import Image from 'next/image'
import './Account.css'
import { AccountType } from '@/types/account'

export default function Account(account: AccountType) {
  return (
    <div className="ph-account">
      <div
        className="ph-account-ring"
        style={{
          borderColor: account.ring_color || '#fff0',
        }}
      >
        <div
          className="ph-account-status"
          style={{
            bottom: 0,
            right: 0,
            background: account.status_rb_color || '#fff0',
          }}
        ></div>
        <Image src={account.icon_url || '/ast-imgs/icon.png'} className="ph-account-icon" alt={account.name || ''} width={42} height={42} unoptimized />
      </div>
      <div className="ph-account-nameplate">
        <div className="ph-account-name">{account.name}</div>
        <div className="ph-account-nameplate-under">
          <div className="ph-account-name_id">{'@' + account.name_id}</div>
        </div>
      </div>
    </div>
  )
}
