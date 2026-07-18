"use client";

import { useMemo } from 'react';
import { EmojiType } from '@/types/emoji';
import { SkinToneId, SKIN_TONE_DISPLAY, buildToneDisplay } from './skinTone';

// スキントーンのスウォッチに使うベース絵文字（✋）
const SWATCH_BASE = '\u{270B}';

interface EmojiGridProps {
  emojis: EmojiType[] | undefined;
  onEmojiSelect: (emoji: EmojiType) => void;
  selectedTone: SkinToneId | null;
  onToneChange: (tone: SkinToneId | null) => void;
}

export default function EmojiGrid({ emojis, onEmojiSelect, selectedTone, onToneChange }: EmojiGridProps) {
  const { display, hasSkinTone } = useMemo(() => buildToneDisplay(emojis ?? [], selectedTone), [emojis, selectedTone]);

  return (
    <>
      {hasSkinTone && (
        <div className="emoji-skin-tone-selector">
          <button
            type="button"
            className={`emoji-skin-tone${selectedTone === null ? ' active' : ''}`}
            onClick={() => onToneChange(null)}
            title="デフォルト"
          >
            {SWATCH_BASE}
          </button>
          {SKIN_TONE_DISPLAY.map(tone => (
            <button
              key={tone.id}
              type="button"
              className={`emoji-skin-tone${selectedTone === tone.id ? ' active' : ''}`}
              onClick={() => onToneChange(tone.id)}
              title={tone.id}
            >
              {`${SWATCH_BASE}${tone.modifier}`}
            </button>
          ))}
        </div>
      )}
      <div className="emoji-menu-grid">
        {display.map(emoji => (
          <button
            key={emoji.name_id}
            className="emoji-item"
            onClick={() => onEmojiSelect(emoji)}
            title={emoji.name_id}
          >
            {emoji.image_url ? (
              <img src={emoji.image_url} alt={emoji.name} className="emoji-image" />
            ) : (
              <span className="emoji-char">{emoji.name}</span>
            )}
          </button>
        ))}
      </div>
    </>
  );
}
