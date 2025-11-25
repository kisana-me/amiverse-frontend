"use client";

import MainHeader from "@/app/components/main_header/MainHeader";
import Link from "next/link";

export default function Page() {

  return (
    <>
      <MainHeader>
        プライバシーポリシー
      </MainHeader>
      
      <p>本サービスのプライバシーポリシーは、下記リンク先に記載しております。</p>

      <Link
        href="https://anyur.com/privacy-policy"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          textDecoration: 'underline',
          color: 'rgb(55 222 45)',
        }}>
        ANYUR プライバシーポリシー
      </Link>
    </>
  );
}
