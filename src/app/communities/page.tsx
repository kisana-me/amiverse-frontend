'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import MainHeader from '@/components/main_header/MainHeader'
import { api } from '@/lib/axios'
import { useCurrentAccount } from '@/providers/CurrentAccountProvider'
import { CommunityType } from '@/types/community'
import styles from './style.module.css'

export default function Page() {
  const [communities, setCommunities] = useState<CommunityType[] | null>(null)
  const { currentAccountStatus } = useCurrentAccount()

  useEffect(() => {
    if (currentAccountStatus === 'loading') return
    let active = true
    api
      .post('/communities')
      .then((res) => {
        if (active) setCommunities((res.data?.communities ?? []) as CommunityType[])
      })
      .catch(() => {
        if (active) setCommunities([])
      })
    return () => {
      active = false
    }
  }, [currentAccountStatus])

  return (
    <>
      <MainHeader>コミュニティ</MainHeader>
      <div className={styles.communities}>
        {communities === null ? null : communities.length === 0 ? (
          <div className={styles.empty}>コミュニティはございません</div>
        ) : (
          communities.map((community) => (
            <Link prefetch={false} key={community.aid} href={`/communities/${community.aid}`} className={styles.card}>
              <div className={styles.cardBody}>
                <img className={styles.cardIcon} src={community.icon_url || '/ast-imgs/icon.png'} alt="アイコン" />
                <div className={styles.cardTexts}>
                  <div className={styles.cardName}>{community.name}</div>
                  {community.description && <div className={styles.cardDescription}>{community.description}</div>}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </>
  )
}
