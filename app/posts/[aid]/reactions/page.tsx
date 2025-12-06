"use client";

import MainHeader from "@/app/components/main_header/MainHeader";
import AccountItem from "@/app/components/account/account_item";
import { api } from "@/app/lib/axios";
import { AccountType } from "@/types/account";
import { use, useCallback, useEffect, useState } from "react";
import { useCurrentAccount } from "@/app/providers/CurrentAccountProvider";

type Props = {
  params: Promise<{
    aid: string;
  }>;
};

type ReactionType = {
  account: AccountType;
  emoji: {
    aid: string;
    name: string;
    image_url?: string | null;
  };
};

type EmojiType = {
  aid: string;
  name: string;
  image_url?: string | null;
};

export default function Page({ params }: Props) {
  const { aid } = use(params);
  const { currentAccountStatus } = useCurrentAccount();
  const [reactions, setReactions] = useState<ReactionType[]>([]);
  const [emojis, setEmojis] = useState<EmojiType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedEmojiAid, setSelectedEmojiAid] = useState<string | null>(null);

  const fetchReactions = useCallback(() => {
    if (currentAccountStatus === "loading") return;
    setLoading(true);
    
    const payload: any = {};
    if (selectedEmojiAid) {
      payload.emoji_aid = selectedEmojiAid;
    }

    api.post('/posts/' + aid + '/reactions', payload).then((res: any) => {
      setReactions(res.data.reactions);
      // Only set emojis on first load or if we want to update the tabs dynamically
      // But usually tabs should show all available reaction types for the post
      // The backend returns 'emojis' which are all unique emojis used on the post
      if (res.data.emojis && emojis.length === 0) {
        setEmojis(res.data.emojis);
      }
    }).catch(() => {
      // Handle error
    }).finally(() => {
      setLoading(false);
    });
  }, [aid, currentAccountStatus, selectedEmojiAid, emojis.length]);

  useEffect(() => {
    fetchReactions();
  }, [fetchReactions, currentAccountStatus]);

  return (
    <>
      <MainHeader>リアクションしたユーザー</MainHeader>
      
      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-[var(--border-color)] no-scrollbar">
        <button
          onClick={() => setSelectedEmojiAid(null)}
          className={`px-4 py-3 whitespace-nowrap font-bold transition-colors ${
            selectedEmojiAid === null
              ? "text-[var(--main-font-color)] border-b-2 border-[var(--main-color)]"
              : "text-[var(--inconspicuous-font-color)] hover:bg-[var(--hover-color)]"
          }`}
        >
          すべて
        </button>
        {emojis.map((emoji) => (
          <button
            key={emoji.aid}
            onClick={() => setSelectedEmojiAid(emoji.aid)}
            className={`px-4 py-3 whitespace-nowrap font-bold transition-colors flex items-center ${
              selectedEmojiAid === emoji.aid
                ? "text-[var(--main-font-color)] border-b-2 border-[var(--main-color)]"
                : "text-[var(--inconspicuous-font-color)] hover:bg-[var(--hover-color)]"
            }`}
          >
            {emoji.image_url ? (
              <img src={emoji.image_url} alt={emoji.name} className="w-5 h-5 mr-1 object-contain" />
            ) : (
              <span className="mr-1 text-lg leading-none">{emoji.name}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-4 text-center text-[var(--inconspicuous-font-color)]">読み込み中...</div>
      ) : (
        <div>
          {reactions.length > 0 ? (
            reactions.map((reaction, index) => (
              <AccountItem 
                key={`${reaction.account.aid}-${index}`} 
                account={reaction.account} 
                reactionEmoji={reaction.emoji}
              />
            ))
          ) : (
            <div className="p-4 text-center text-[var(--inconspicuous-font-color)]">リアクションはありません</div>
          )}
        </div>
      )}
    </>
  );
}
