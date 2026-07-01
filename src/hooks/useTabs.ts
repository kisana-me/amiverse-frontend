"use client";

import { useState, useCallback, type ReactNode } from "react";

export type TabDef<K extends string = string> = {
  key: K;
  label: ReactNode;
};

export type UseTabsOptions<K extends string> = {
  tabs: TabDef<K>[];
  defaultTab?: K;
  onBeforeChange?: (nextTab: K, currentTab: K) => boolean;
};

export type UseTabsReturn<K extends string> = {
  tabs: TabDef<K>[];
  activeTab: K;
  changeTab: (key: K) => void;
  setActiveTab: (key: K) => void;
};

/**
 * 汎用タブ状態管理フック
 *
 * 外部依存なし（React state のみ）。
 * URL同期やアクセス制御などの画面固有ロジックは、
 * onBeforeChange コールバックや呼び出し側で実装する。
 *
 * @example
 * // 基本的な使い方
 * const { tabs, activeTab, changeTab } = useTabs({
 *   tabs: [
 *     { key: 'posts', label: '投稿' },
 *     { key: 'replies', label: '返信' },
 *     { key: 'media', label: 'メディア' },
 *   ],
 * });
 *
 * @example
 * // アクセス制御付き
 * const { tabs, activeTab, changeTab } = useTabs({
 *   tabs: [...],
 *   onBeforeChange: (nextTab) => {
 *     if (nextTab === 'following' && !isSignedIn) {
 *       showModal();
 *       return false; // 切替を阻止
 *     }
 *     return true;
 *   },
 * });
 *
 * @example
 * // 動的タブ（リアクション種類など）
 * const { tabs, activeTab, changeTab } = useTabs({
 *   tabs: reactions.map(r => ({ key: r.type, label: r.emoji })),
 * });
 */
export function useTabs<K extends string>(options: UseTabsOptions<K>): UseTabsReturn<K> {
  const { tabs, defaultTab, onBeforeChange } = options;

  const [activeTab, setActiveTabState] = useState<K>(
    defaultTab ?? tabs[0]?.key
  );

  const setActiveTab = useCallback((key: K) => {
    setActiveTabState(key);
  }, []);

  const changeTab = useCallback((key: K) => {
    if (onBeforeChange && !onBeforeChange(key, activeTab)) {
      return;
    }
    setActiveTabState(key);
  }, [onBeforeChange, activeTab]);

  return { tabs, activeTab, changeTab, setActiveTab };
}
