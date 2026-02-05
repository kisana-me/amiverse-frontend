"use client";

import MainHeader from "@/components/main_header/MainHeader";
import Link from "next/link";

export default function Page() {

  return (
    <>
      <MainHeader>
        利用規約
      </MainHeader>
      
      <p>本サービスの利用規約は、下記リンク先に記載しております。</p>

      <Link
        href="https://anyur.com/terms-of-service"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          textDecoration: 'underline',
          color: 'rgb(55 222 45)',
        }}>
        ANYUR 利用規約
      </Link>
    </>
  );
}
