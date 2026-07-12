'use client'

import Link from 'next/link'
import Image from 'next/image'
import styles from '../styles/Account.module.css'
import { AccountType } from '@/types/account'

export default function Account(account: AccountType) {
  return (
    <Link prefetch={false} className={styles.account} href={'/@' + account.name_id}>
      <Image src={account.icon_url || '/ast-imgs/icon.png'} className={styles.account_icon} alt={account.name || ''} width={42} height={42} unoptimized />
    </Link>
  )
}
