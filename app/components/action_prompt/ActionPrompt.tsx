"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useCurrentAccount } from "@/app/providers/CurrentAccountProvider";
import "./style.css";

export default function ActionPrompt() {
  const { currentAccountStatus } = useCurrentAccount();
  const [isVisible, setIsVisible] = useState(false);

  // Wait for initial load to complete before showing
  useEffect(() => {
    if (currentAccountStatus !== "loading") {
      // Small delay for smooth appearance
      const timer = setTimeout(() => setIsVisible(true), 300);
      return () => clearTimeout(timer);
    }
  }, [currentAccountStatus]);

  if (!isVisible || currentAccountStatus === "loading") {
    return null;
  }

  // Signed in: Show new post FAB button
  if (currentAccountStatus === "signed_in") {
    return (
      <div className="action-prompt-container">
        <Link href="/posts/new" className="new-post-fab" aria-label="新規投稿">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </Link>
      </div>
    );
  }

  // Signed out: Show sign in banner
  return (
    <div className="signin-banner-container">
      <div className="signin-banner">
        <div className="signin-banner-content">
          <p className="signin-banner-title">Amiverseに参加しよう</p>
          <p className="signin-banner-description">
            投稿やフォローなど、すべての機能をご利用いただけます
          </p>
        </div>
        <div className="signin-banner-actions">
          <Link href="/signin" className="signin-banner-button signin-banner-button-primary">
            サインイン
          </Link>
        </div>
      </div>
    </div>
  );
}
