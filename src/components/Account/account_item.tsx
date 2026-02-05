"use client";

import Link from "next/link";
import { AccountType } from "@/types/account";

type Props = {
  account: AccountType;
  reactionEmoji?: {
    name: string;
    image_url?: string | null;
  };
};

export default function AccountItem({ account, reactionEmoji }: Props) {
  return (
    <div className="flex flex-row items-center p-3 border-b border-[var(--border-color)] hover:bg-[var(--hover-color)] transition-colors">
      <Link href={'/@' + account.name_id} className="flex flex-row items-center flex-grow min-w-0 text-inherit no-underline group">
        <div className="relative w-10 h-10 mr-3 flex-shrink-0">
           <div className="absolute inset-0 rounded-full border-2 pointer-events-none" style={{ borderColor: account.ring_color || '#fff0' }}></div>
           <img src={account.icon_url || "/ast-imgs/icon.png"} className="w-full h-full rounded-full object-cover" alt={account.name} />
           <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full border border-[var(--bg-color)]" style={{ background: account.status_rb_color || '#fff0' }}></div>
        </div>
        <div className="flex flex-col min-w-0 flex-grow">
          <div className="font-bold truncate text-[var(--main-font-color)] group-hover:underline">
            {account.name}
          </div>
          <div className="text-sm truncate text-[var(--inconspicuous-font-color)]">
            {'@' + account.name_id}
          </div>
        </div>
      </Link>
      {reactionEmoji && (
        <div className="ml-2 flex-shrink-0">
          {reactionEmoji.image_url ? (
            <img src={reactionEmoji.image_url} className="w-6 h-6 object-contain" alt={reactionEmoji.name} />
          ) : (
            <span className="text-xl leading-none">{reactionEmoji.name}</span>
          )}
        </div>
      )}
    </div>
  );
}
