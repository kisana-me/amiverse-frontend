"use client";

import MainHeader from "@/components/main_header/MainHeader";
import Account from "@/components/Account/OneLine";
import { api } from "@/lib/axios";
import { AccountType } from "@/types/account";
import { EmojiType } from "@/types/emoji";
import { use, useCallback, useEffect, useState } from "react";
import { useCurrentAccount } from "@/app/providers/CurrentAccountProvider";

type Props = {
  params: Promise<{
    aid: string;
  }>;
};

type ReactionType = {
  account: AccountType;
  emoji: EmojiType;
};

export default function Page({ params }: Props) {
  const { aid } = use(params);
  const { currentAccountStatus } = useCurrentAccount();
  const [reactions, setReactions] = useState<ReactionType[]>([]);
  const [emojis, setEmojis] = useState<EmojiType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedEmojiNameId, setSelectedEmojiNameId] = useState<string | null>(null);

  const fetchReactions = useCallback(() => {
    if (currentAccountStatus === "loading") return;
    setLoading(true);

    const payload: { emoji_name_id?: string | null } = {};
    if (selectedEmojiNameId) {
      payload.emoji_name_id = selectedEmojiNameId;
    }

    api.post('/posts/' + aid + '/reactions', payload).then((res: { data: { reactions: ReactionType[], emojis: EmojiType[] } }) => {
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
  }, [aid, currentAccountStatus, selectedEmojiNameId, emojis.length]);

  useEffect(() => {
    fetchReactions();
  }, [fetchReactions, currentAccountStatus]);

  return (
    <>
      <MainHeader>リアクションしたユーザー</MainHeader>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-[var(--border-color)] no-scrollbar">
        <button
          onClick={() => setSelectedEmojiNameId(null)}
          className={`px-4 py-3 whitespace-nowrap font-bold transition-colors cursor-pointer ${
            selectedEmojiNameId === null
              ? "text-[var(--main-font-color)] border-b-2 border-[var(--main-color)]"
              : "text-[var(--inconspicuous-font-color)] hover:bg-[var(--hover-color)]"
          }`}
        >
          すべて
        </button>
        {emojis.map((emoji) => (
          <button
            key={emoji.name_id}
            onClick={() => setSelectedEmojiNameId(emoji.name_id)}
            className={`px-4 py-3 whitespace-nowrap font-bold transition-colors cursor-pointer flex items-center ${
              selectedEmojiNameId === emoji.name_id
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
              <Account key={`${reaction.account.aid}-${index}`} account={reaction.account} classes="p-1 box-content">
                <div className="ml-2 mr-2 flex-shrink-0">
                  {reaction.emoji ? (
                    <>{reaction.emoji.image_url ? (
                      <img src={reaction.emoji.image_url} className="w-6 h-6 object-contain" alt={reaction.emoji.name} />
                    ) : (
                      <span className="text-xl leading-none">{reaction.emoji.name}</span>
                    )}</>
                  ) : '?'}
                </div>
              </Account>
            ))
          ) : (
            <div className="p-4 text-center text-[var(--inconspicuous-font-color)]">リアクションはありません</div>
          )}
        </div>
      )}
    </>
  );
}
