"use client";

import "./style.css"
import Link from "next/link";
import { useOverlay } from "@/app/providers/OverlayProvider";
import { useTrends } from "@/app/providers/TrendsProvider";
import SkeletonBox from "../skeletons/skeleton_box";
import Footer from "../footer/Footer";

export default function Aside() {
  const { isAsideMenuOpen } = useOverlay();
  const { trends, trendsLoading } = useTrends();

  // Get the first trend category and display its top 5 items
  const trendData = trends.length > 0 ? trends[0] : null;
  const topTrends = trendData?.ranking.slice(0, 5) || [];

  return (
    <aside className={isAsideMenuOpen ? 'show-aside' : ''}>
      <div className="aside-content">
        {/* Trends Section */}
        <div className="aside-section">
          <h2 className="aside-section-title">トレンド</h2>
          {trendsLoading ? (
            <div className="aside-trend-list">
              {[...Array(5)].map((_, index) => (
                <div className="aside-trend-item" key={index}>
                  <div className="aside-trend-rank">
                    <SkeletonBox width="30px" height="14px" />
                  </div>
                  <div className="aside-trend-word">
                    <SkeletonBox width="100px" height="16px" />
                  </div>
                  <div className="aside-trend-count">
                    <SkeletonBox width="40px" height="14px" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="aside-trend-list">
                {topTrends.map((trend, index) => (
                  <Link 
                    href={`/search?query=${encodeURIComponent(trend.word)}`} 
                    className="aside-trend-item" 
                    key={index}
                  >
                    <div className="aside-trend-rank">{index + 1}位</div>
                    <div className="aside-trend-word">{trend.word}</div>
                    <div className="aside-trend-count">{trend.count}件</div>
                  </Link>
                ))}
              </div>
              <Link href="/discovery" className="aside-more-link">
                もっと見る
              </Link>
            </>
          )}
        </div>

        {/* Links Section */}
        <footer className="aside-section">
          <h2 className="aside-section-title">リンク</h2>
          <div className="aside-links">
            <Link href="/terms-of-service" className="aside-link-item">
              <div className="aside-link-text">利用規約</div>
            </Link>
            <Link href="/privacy-policy" className="aside-link-item">
              <div className="aside-link-text">プライバシーポリシー</div>
            </Link>
            <Link href="/contact" className="aside-link-item">
              <div className="aside-link-text">お問い合わせ</div>
            </Link>
          </div>
        </footer>
      </div>
    </aside>
  );
};
