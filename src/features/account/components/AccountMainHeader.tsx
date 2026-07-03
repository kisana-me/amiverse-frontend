'use client'

import Link from 'next/link'
import { AccountType } from '@/types/account'
import styles from '../styles/AccountMainHeader.module.css'

type Props = {
  account: AccountType
  isOwnAccount?: boolean
  onFollow: () => void
}

export default function AccountMainHeader({ account, isOwnAccount = false, onFollow }: Props) {
  return (
    <div className={styles.header}>
      <div className={styles.icon_wrap} style={{ borderColor: account.ring_color || '#fff0' }}>
        <div className={styles.status} style={{ bottom: 0, right: 0, background: account.status_rb_color || '#fff0' }}></div>
        <img src={account.icon_url || '/ast-imgs/icon.png'} className={styles.icon} alt="アイコン" />
      </div>
      <div className={styles.nameplate}>
        <div className={styles.name}>{account.name}</div>
        <div className={styles.id}>@{account.name_id}</div>
      </div>
      <div className={styles.right}>
        {isOwnAccount ? (
          <Link prefetch={false} href="/settings/account" className={styles.button}>
            編集
          </Link>
        ) : (
          <button
            className={styles.button}
            onClick={onFollow}
            style={{
              backgroundColor: account.is_following ? 'var(--bg-secondary)' : 'var(--link-color)',
              color: account.is_following ? 'var(--text-primary)' : '#000',
            }}
          >
            {account.is_following ? 'Following' : 'Follow'}
          </button>
        )}
      </div>
    </div>
  )
}
