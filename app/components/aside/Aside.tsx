"use client";

import "./style.css"
import Link from "next/link";
import { useOverlay } from "@/app/providers/OverlayProvider";
import Footer from "../footer/Footer";

export default function Aside() {
  const { isAsideMenuOpen } = useOverlay();

  return (
    <aside className={isAsideMenuOpen ? 'show-aside' : ''}>
      <div>
        <h2>トレンド</h2>
        {/* <TrendsMiniList /> */}
        <Link href='/'>もっと見る</Link>
        <br />
        ログイン / サインアップ
      </div>
      {<Footer />}
    </aside>
  );
};
