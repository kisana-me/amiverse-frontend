'use client'

import { AccountType } from '@/types/account'
import styles from '../styles/AccountBanner.module.css'

type Props = {
  account: AccountType
}

export default function AccountBanner({ account }: Props) {
  return (
    <div className={styles.banner}>
      <img className={styles.image} src={account.banner_url || '/ast-imgs/banner.png'} alt="バナー" />
    </div>
  )
}
