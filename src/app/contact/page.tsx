"use client";

import MainHeader from "@/components/main_header/MainHeader";
import Link from "next/link";

export default function Page() {

  return (
    <>
      <MainHeader>
        お問い合わせ
      </MainHeader>
      
      <p>本サービスのお問い合わせは、下記リンク先に記載しております。</p>

      <Link
        href="https://anyur.com/contact"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          textDecoration: 'underline',
          color: 'rgb(55 222 45)',
        }}>
        ANYUR お問い合わせ
      </Link>
    </>
  );
}
