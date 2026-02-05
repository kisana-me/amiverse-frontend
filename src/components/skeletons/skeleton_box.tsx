"use client";

import "./style.css";

export default function SkeletonBox({ width = "100px", height = "24px" }) {
  return (
    <>
      <div className="skeleton-outside" style={{ width, height }}>
        <div className="skeleton-inside" />
      </div>
    </>
  )
}
