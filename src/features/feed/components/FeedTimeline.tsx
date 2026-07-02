"use client";

import Feed from "@/features/feed/components/Feed";
import InfiniteScrollSentinel from "@/components/infinite_scroll_sentinel/InfiniteScrollSentinel";
import { UseFeedTimelineReturn } from "@/hooks/useFeedTimeline";

type FeedTimelineProps = {
  timeline: UseFeedTimelineReturn;
  /** Feed の feed.type に渡す値（キャッシュキー） */
  feedType: string;
  /** このタブが現在アクティブか。無限スクロールの発火をアクティブタブのみに限定する */
  isActive: boolean;
  /** 無限スクロール UI を出すか。false なら追加読込しない（おすすめタブなど） */
  infiniteScroll?: boolean;
};

/**
 * useFeedTimeline のデータをタイムラインとして描画するパネル。
 * Feed 本体と、その下の「無限スクロールセンチネル / すべて読み込み済み」表示を担う。
 */
export default function FeedTimeline({
  timeline,
  feedType,
  isActive,
  infiniteScroll = true,
}: FeedTimelineProps) {
  const { posts, feed, isLoading, hasMore, isLoadingMore, loadMore } = timeline;

  return (
    <div style={{ minHeight: '100%' }}>
      <Feed
        posts={posts}
        feed={feed ? { objects: feed.objects, type: feedType, fetched_at: feed.fetched_at?.toString() } : undefined}
        is_loading={isLoading}
      />

      {isActive && infiniteScroll && posts.length > 0 && !isLoading && (
        hasMore ? (
          <InfiniteScrollSentinel onIntersect={loadMore} isLoading={isLoadingMore} />
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            すべてを読み込みました
          </div>
        )
      )}
    </div>
  );
}
