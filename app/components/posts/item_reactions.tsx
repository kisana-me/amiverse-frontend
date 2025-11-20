"use client";

import { useState, useRef } from 'react'
import "./item_reactions.css"

type ItemReactionsType = {
  reactions_counter: number;
  reactions: {
    emoji: {
      aid: string;
      name: string;
    };
    reaction_count: number;
    reacted: boolean;
  }[];
  control_disabled?: boolean;
}

export default function ItemReactions({ item }: { item: ItemReactionsType }) {
  const emojiButtonRef = useRef(null)
  const [isEmojiMenuOpen, setIsEmojiMenuOpen] = useState(false)

  const itemReact = async (emoji_aid: string) => {
    console.log(`Reacted: ${emoji_aid}`)
  }

  return (
    <>
      <div className="reactions">
        <div className="reactions-content">
          <button
            ref={emojiButtonRef}
            className='reaction-button rb-emojis'
            onClick={() => setIsEmojiMenuOpen(!isEmojiMenuOpen)}
            disabled={item.control_disabled === true}
          >
            <div className="reaction-icon">
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M76 11H70V24H57V30H70V43H76V30H89V24H76V11ZM50 27C50 21.5581 51.8899 16.5576 55.0492 12.6192C52.7609 12.2123 50.4052 12 48 12C25.9086 12 8 29.9086 8 52C8 74.0914 25.9086 92 48 92C70.0914 92 88 74.0914 88 52C88 49.5948 87.7877 47.2391 87.3808 44.9508C83.4424 48.1101 78.4419 50 73 50C60.2975 50 50 39.7025 50 27ZM36 34C32.6863 34 30 36.6863 30 40C30 43.3137 32.6863 46 36 46C39.3137 46 42 43.3137 42 40C42 36.6863 39.3137 34 36 34ZM32.8247 59C32.3692 59 32 59.3693 32 59.8247C32 68.2058 38.7942 75 47.1753 75H51.8247C60.2058 75 67 68.2058 67 59.8247C67 59.3693 66.6308 59 66.1753 59H32.8247Z" fill="currentColor"/>
              </svg>
            </div>
            <div className="reaction-number">{item.reactions_counter}</div>
          </button>
        </div>

        <div className="reactions-content">
          {item.reactions.map(reaction => (
            <button className={"reaction-button rb-emoji" + (reaction.reacted ? " rb-reacted" : "")}
              key={reaction.emoji.aid}
              onClick={() => itemReact(reaction.emoji.aid)}
              disabled={item.control_disabled === true}
            >
              <div className="reaction-emoji">
                {reaction.emoji.name}
              </div>
              <div className="reaction-number">
                {reaction.reaction_count}
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
