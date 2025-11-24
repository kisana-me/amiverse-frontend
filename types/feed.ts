export type FeedType = {
  type: string;
  objects: FeedItemType[];
  fetched_at?: string;
};

export type FeedItemType = {
  type: "post" | "diffuse";
  post_aid: string;
  account_aid?: string;
  created_at?: string;
};
