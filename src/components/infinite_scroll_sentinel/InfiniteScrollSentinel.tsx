"use client";

import { useEffect, useRef } from "react";

// IntersectionObserverを使った無限スクロール用センチネルコンポーネント
export default function InfiniteScrollSentinel({ onIntersect, isLoading }: { onIntersect: () => void; isLoading: boolean }) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const onIntersectRef = useRef(onIntersect);
  onIntersectRef.current = onIntersect;

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onIntersectRef.current();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={sentinelRef} style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
      {isLoading && (
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          読み込み中...
        </div>
      )}
    </div>
  );
}
