'use client'

import Image from 'next/image'
import styles from '../styles/Account.module.css'
import { AccountType } from '@/types/account'

export default function Account(account: AccountType) {
  return (
    <div className={styles.account}>
      <div
        className={styles.account_ring}
        style={{
          borderColor: account.ring_color || '#fff0',
        }}
      >
        <div
          className={styles.account_status}
          style={{
            bottom: 0,
            right: 0,
            background: account.status_rb_color || '#fff0',
          }}
        ></div>
        <Image src={account.icon_url || '/ast-imgs/icon.png'} className={styles.account_icon} alt={account.name || ''} width={42} height={42} unoptimized />
      </div>
      <div className={styles.account_nameplate}>
        <div className={styles.account_name}>{account.name}</div>
        <div className={styles.account_nameplate_under}>
          <div className={styles.account_name_id}>{'@' + account.name_id}</div>
        </div>
      </div>
    </div>
  )
}
