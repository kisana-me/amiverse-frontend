import { PostType } from "./post";

export type AccountType = {
  aid: string;
  name: string;
  name_id: string;
  icon_url: string;
  description?: string;
  ring_color?: string;
  status_rb_color?: string;

  posts: PostType;
}
