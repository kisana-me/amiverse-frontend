import { AccountType } from "./account";
import { EmojiType } from "./emoji";

export type PostType = {
  aid: string;
  content: string;
  visibility: string;
  created_at: string;

  reply_presence: boolean;
  quote_presence: boolean;

  replies_count: number;
  quotes_count: number;
  diffuses_count: number;
  reactions_count: number;
  views_count: number;

  is_diffused?: boolean;
  is_reacted?: boolean;

  reply?: PostType;
  quote?: PostType;

  reactions?: EmojiType[];

  images?: {
    aid: string;
    name: string;
    description?: string;
    url: string;
  }[];
  videos?: {
    aid: string;
    name: string;
    description?: string;
    url: string;
  }[];

  account: AccountType;

  is_busy?: boolean;
}
