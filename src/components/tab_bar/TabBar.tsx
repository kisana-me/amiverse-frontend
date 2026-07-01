"use client";

import { type ReactNode } from "react";
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
 */
export default function TabBar<K extends string = string>({ tabs, activeTab, onTabChange }: TabBarProps<K>) {
  return (
    <div className="tab-bar">
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
