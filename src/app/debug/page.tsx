"use client";

import "./style.css";
import { useState, useEffect } from 'react';
import MainHeader from '@/components/main_header/MainHeader';
import { useToast } from "@/app/providers/ToastProvider";

export default function Page() {
  const { addToast } = useToast();

  return (
    <>
      <MainHeader>
        Debug Page
      </MainHeader>
      <h2>トースト通知</h2>
      <button onClick={() => addToast({ message: "これはトースト通知です" })}>message</button>
      <br />
      <button onClick={() => addToast({ message: "これはトースト通知です", detail: "詳細情報です" })}>message + detail</button>
    </>
  );
}
