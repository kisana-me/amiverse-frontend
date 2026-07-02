'use client'

import Link from 'next/link'
import { AccountType } from '@/types/account'
import styles from '../styles/AccountPlate.module.css'

type Props = {
  account: AccountType
  isOwnAccount?: boolean
  onFollow: () => void
  onMenu: () => void
}

export default function AccountPlate({ account, isOwnAccount = false, onFollow, onMenu }: Props) {
  return (
    <div className={styles.plate}>
      <div className={styles.icon_container} style={{ borderColor: account.ring_color || '#fff0' }}>
        <div className={styles.icon_status} style={{ background: account.status_rb_color || '#fff0' }}></div>
        <img className={styles.icon_image} src={account.icon_url || '/ast-imgs/icon.png'} alt="アイコン" />
      </div>

      <div className={styles.nameplate}>
        <div className={styles.name}>{account.name}</div>
        <div className={styles.id}>@{account.name_id}</div>
      </div>

      <div className={styles.buttons}>
        {isOwnAccount ? (
          <Link prefetch={false} href="/settings/account" className={styles.button}>
            プロフィールを編集
          </Link>
        ) : (
          <button
            className={styles.button}
            onClick={onFollow}
            style={{
              backgroundColor: account.is_following ? 'var(--bg-secondary)' : 'var(--accent-color)',
              color: account.is_following ? 'var(--text-primary)' : '#fff',
            }}
          >
            {account.is_following ? 'Following' : 'Follow'}
          </button>
        )}
        <button
          className={styles.button}
          onClick={onMenu}
          style={{
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
          }}
        >
          Menu
        </button>
      </div>

      {account.badges && account.badges.length > 0 && (
        <div className={styles.badges}>
          {account.badges.map((badge, index) => (
            <div className={styles.badge} key={index}>
              <img className={styles.badge_icon} src={badge.url} alt={badge.name + ' badge icon'} />
              <div className={styles.badge_name}>{badge.name}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
