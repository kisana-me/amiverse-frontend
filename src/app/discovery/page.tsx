"use client";

import "./style.css";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import MainHeader from '@/components/main_header/MainHeader';
import SkeletonTrendList from "@/components/trend/skeleton_trend";
import TrendList from "@/components/trend/trend_list";
import { useTrends } from "../providers/TrendsProvider";

export default function Page() {
  const { trends, trendsLoading } = useTrends();
  const router = useRouter();
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
        <input
          type="search"
          value={searchInput}
          onChange={handleSearchChange}
          placeholder="検索ワードを入力"
          className="search-input"
        />
        <button onClick={handleSearchClick} className="search-button">
          🔎
        </button>
      </MainHeader>
      <div className="discovery">

        {trendsLoading ? (
          <>
            <SkeletonTrendList />
          </>
        ) : (
          <>
            {trends.map((trend, index) => (
              <TrendList {...trend} key={index} />
            ))}
          </>
        )}

        {!trendsLoading && trends.length === 0 && (
          <div className="no-trends">トレンドはありません</div>
        )}

      </div>
    </>
  );
}
