"use client";

import { useState, useEffect, useCallback } from 'react';
import { useEmoji } from '@/providers/EmojiProvider';
import TabContent from '@/components/tab_content/TabContent';
import EmojiGrid from './EmojiGrid';
import { SkinToneId } from './skinTone';
import "./style.css";

import { EmojiType } from '@/types/emoji';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: EmojiType) => void;
}

export default function EmojiPicker({ onEmojiSelect }: EmojiPickerProps) {
  const { groups, emojisByGroup, fetchGroups, fetchEmojisByGroup } = useEmoji();
  // groups の初期値は defaultEmojiGroups（非空）なので先頭グループが必ず入る
  const [activeGroup, setActiveGroup] = useState<string>(() => groups[0] ?? '');
  // 肌色の選択はグループ横断で保持する（未選択＝デフォルトの黄色）
  const [selectedTone, setSelectedTone] = useState<SkinToneId | null>(null);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const activeIndex = activeGroup ? groups.indexOf(activeGroup) : 0;

  // アクティブタブと左右の隣接タブ分だけ絵文字を取得しておく。
  // 全パネルを一度に描画すると重い（people-body だけで 2000 件超）ため、
  // スワイプで現れる隣接分だけ先読みする。
  useEffect(() => {
    if (groups.length === 0) return;
    for (const i of [activeIndex - 1, activeIndex, activeIndex + 1]) {
      const group = groups[i];
      if (group) fetchEmojisByGroup(group);
    }
  }, [activeIndex, groups, fetchEmojisByGroup]);

  // TabContent のパネル描画。アクティブ＋隣接タブのみ実体を描画し、
  // 遠いタブは空プレースホルダーにして DOM ノード数を抑える。
  const renderPanel = useCallback(
    (tabKey: string) => {
      const idx = groups.indexOf(tabKey);
      const isNear = Math.abs(idx - activeIndex) <= 1;
      if (!isNear) return <div className="emoji-menu-grid" />;

      return (
        <EmojiGrid
          emojis={emojisByGroup[tabKey]}
          onEmojiSelect={onEmojiSelect}
          selectedTone={selectedTone}
          onToneChange={setSelectedTone}
        />
      );
    },
    [groups, activeIndex, emojisByGroup, onEmojiSelect, selectedTone]
  );

  if (groups.length === 0) return null;

  const tabs = groups.map(group => ({ key: group, label: group }));

  return (
    <TabContent
      className="emoji-picker"
      tabs={tabs}
      defaultTab={groups[0]}
      onTabChange={setActiveGroup}
      ignoreDialogGestures={false}
      renderHeader={(tabBar) => <div className="emoji-picker-tabbar">{tabBar}</div>}
    >
      {renderPanel}
    </TabContent>
  );
}
