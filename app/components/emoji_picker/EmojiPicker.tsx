"use client";

import { useState, useEffect } from 'react';
import { useEmoji } from '@/app/providers/EmojiProvider';
import "./style.css";

interface EmojiPickerProps {
  onEmojiSelect: (emoji_aid: string) => void;
}

export default function EmojiPicker({ onEmojiSelect }: EmojiPickerProps) {
  const { groups, emojisByGroup, fetchGroups, fetchEmojisByGroup } = useEmoji();
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  useEffect(() => {
    if (groups.length > 0 && !selectedGroup) {
      setSelectedGroup(groups[0]);
    }
  }, [groups, selectedGroup]);

  useEffect(() => {
    if (selectedGroup) {
      fetchEmojisByGroup(selectedGroup);
    }
  }, [selectedGroup, fetchEmojisByGroup]);

  return (
    <div className="emoji-picker">
      <div className="emoji-groups-tabs">
        {groups.map(group => (
          <button
            key={group}
            className={`emoji-group-tab ${selectedGroup === group ? 'active' : ''}`}
            onClick={() => setSelectedGroup(group)}
          >
            {group}
          </button>
        ))}
      </div>
      <div className="emoji-menu-grid">
        {selectedGroup && emojisByGroup[selectedGroup]?.map(emoji => (
          <button
            key={emoji.aid}
            className="emoji-item"
            onClick={() => onEmojiSelect(emoji.aid)}
            title={emoji.name}
          >
            {emoji.image_url ? (
              <img src={emoji.image_url} alt={emoji.name} className="emoji-image" />
            ) : (
              <span className="emoji-char">{emoji.name}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
