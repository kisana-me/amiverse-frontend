export type FeedType = {
  type: string;
  objects: FeedItemType[];
};

export type FeedItemType = {
  type: "post" | "diffuse";
  post_aid: string;
  account_aid?: string;
};
