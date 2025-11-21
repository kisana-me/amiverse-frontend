"use client";

import "./style.css";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import MainHeader from '@/app/components/main_header/MainHeader';

export default function Page() {
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
      <div className="posts-new">
        投稿する
      </div>
    </>
  );
}
