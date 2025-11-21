"use client";

import "./style.css";
import { useState } from 'react';
import MainHeader from '../components/main_header/MainHeader';
import { useUI } from "../providers/UIProvider";

export default function Page() {
  const { userTheme, toggleTheme } = useUI();

  const handleClick = () => {
    toggleTheme();
  }

  return (
    <>
      <MainHeader>
        Notifications
      </MainHeader>
      <div className="notifications">
        <div>通知はございません</div>
      </div>
    </>
  );
}
