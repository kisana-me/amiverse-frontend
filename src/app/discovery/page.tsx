'use client'

import styles from './styles.module.css'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import MainHeader from '@/components/main_header/MainHeader'
import SkeletonTrendList from './_components/skeleton_trend'
import Trend from './_components/trend'
import { useTrends } from '@/providers/TrendsProvider'

export default function Page() {
  const { trends, trendsLoading } = useTrends()
  const router = useRouter()
  const [searchInput, setSearchInput] = useState('')

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value)
  }

  const handleSearchClick = () => {
    if (searchInput) {
      router.push(`/search?query=${searchInput}`)
    }
  }

  return (
    <>
      <MainHeader>
        <input type="search" value={searchInput} onChange={handleSearchChange} placeholder="検索ワードを入力" className={styles.search_input} />
        <button onClick={handleSearchClick} className={styles.search_button}>
          🔎
        </button>
      </MainHeader>
      {trendsLoading ? (
        <>
          <SkeletonTrendList />
        </>
      ) : (
        <>
          {trends.map((trend, index) => (
            <Trend {...trend} key={index} />
          ))}
        </>
      )}

      {!trendsLoading && trends.length === 0 && <div className={styles.no_trends}>トレンドはありません</div>}
    </>
  )
}
