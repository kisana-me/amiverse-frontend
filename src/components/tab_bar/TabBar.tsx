"use client";

import { useEffect, useRef, type ReactNode } from "react";
import "./style.css";

type Tab<K extends string = string> = {
  key: K;
  label: ReactNode;
};

type TabBarProps<K extends string = string> = {
  tabs: Tab<K>[];
  activeTab: K;
  onTabChange: (key: K) => void;
};

/**
 * 汎用タブバーコンポーネント
 *
 * タブボタンの描画とアクティブインジケーターの表示のみを担当。
 * 状態管理は useTabs フックに委譲する。
 *
 * タブがはみ出て横スクロールできる場合、アクティブタブが変わったら
 * そのタブが画面内に収まるよう横スクロールを追従させる（コンテンツ側の
 * スワイプ切替でタブが画面外に出てしまうのを防ぐ）。
 */
export default function TabBar<K extends string = string>({ tabs, activeTab, onTabChange }: TabBarProps<K>) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    // はみ出していない（スクロール不要）なら何もしない
    if (bar.scrollWidth <= bar.clientWidth) return;

    const active = bar.querySelector<HTMLElement>(".tab-bar-item--active");
    if (!active) return;

    // アクティブタブが中央に来るように、バー内だけを横スクロールする
    // （scrollIntoView はページ全体を縦スクロールさせうるため使わない）
    const barRect = bar.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();
    const delta = activeRect.left - barRect.left - (bar.clientWidth - active.offsetWidth) / 2;
    bar.scrollBy({ left: delta, behavior: "smooth" });
  }, [activeTab]);

  // PC（マウス）でのドラッグ横スクロール。タッチは overflow-x のネイティブ
  // スクロールで既に動くのでマウス左ボタンのみを対象にする。
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const bar = barRef.current;
    if (!bar || bar.scrollWidth <= bar.clientWidth) return;

    const startX = e.clientX;
    const startScroll = bar.scrollLeft;
    let moved = false;

    const onMove = (ev: MouseEvent) => {
      const dx = ev.clientX - startX;
      if (Math.abs(dx) > 3) moved = true;
      bar.scrollLeft = startScroll - dx;
      ev.preventDefault();
    };

    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      bar.classList.remove("tab-bar--dragging");
      if (moved) {
        // ドラッグ直後のクリックを1回だけ抑止する。バー外（モーダルのバックドロップ等）で
        // 離すと click は <dialog> 上で発火するため、document のキャプチャ段階で捕まえる。
        // これでタブの誤選択もモーダルの誤クローズも防げる。
        const suppressClick = (ce: MouseEvent) => {
          ce.stopPropagation();
          ce.preventDefault();
          document.removeEventListener("click", suppressClick, true);
        };
        document.addEventListener("click", suppressClick, true);
        // クリックが発生しなかった場合の保険で解除
        setTimeout(() => document.removeEventListener("click", suppressClick, true), 0);
      }
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    bar.classList.add("tab-bar--dragging");
  };

  return (
    <div className="tab-bar" ref={barRef} onMouseDown={handleMouseDown}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={`tab-bar-item${activeTab === tab.key ? " tab-bar-item--active" : ""}`}
          onClick={() => onTabChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
