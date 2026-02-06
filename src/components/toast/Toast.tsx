"use client";

import "./style.css";
import { useToast } from "@/app/providers/ToastProvider";
import { useLayoutEffect, useMemo, useRef } from "react";

export default function Toast() {
  const { showToasts, pauseToasts, resumeToasts, dismissToast } = useToast();

  const items = useMemo(() => {
    // bottom anchored stack (column-reverse) => first item appears at bottom
    // so render newest-first.
    return [...showToasts].sort((a, b) => b.date - a.date);
  }, [showToasts]);

  const itemRefs = useRef(new Map<number, HTMLDivElement | null>());
  const prevRectsRef = useRef(new Map<number, DOMRect>());

  useLayoutEffect(() => {
    const nextRects = new Map<number, DOMRect>();
    for (const toast of items) {
      const el = itemRefs.current.get(toast.date);
      if (!el) continue;
      nextRects.set(toast.date, el.getBoundingClientRect());
    }

    // FLIP: invert
    for (const toast of items) {
      const el = itemRefs.current.get(toast.date);
      if (!el) continue;
      const prev = prevRectsRef.current.get(toast.date);
      const next = nextRects.get(toast.date);
      if (!prev || !next) continue;

      const deltaX = prev.left - next.left;
      const deltaY = prev.top - next.top;
      if (deltaX === 0 && deltaY === 0) continue;

      el.style.transition = "transform 0s";
      el.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
      // play
      requestAnimationFrame(() => {
        el.style.transition = "transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1)";
        el.style.transform = "translate(0px, 0px)";
      });
    }

    prevRectsRef.current = nextRects;
  }, [items]);

  return (
    <div
      className="toast-stack"
      onMouseEnter={pauseToasts}
      onMouseLeave={resumeToasts}
      aria-live="polite"
      aria-relevant="additions removals"
    >
      {items.map((toast) => (
        <div
          key={toast.date}
          className="toast-item"
          ref={(el) => {
            itemRefs.current.set(toast.date, el);
          }}
        >
          <div
            className={
              toast.status === "hide" ? "toast-card toast-card--hide" : "toast-card"
            }
          >
            <div className="toast-header">
              <div className="toast-message">{toast.message}</div>
              <button
                type="button"
                className="toast-close"
                aria-label="トーストを閉じる"
                onClick={() => dismissToast(toast.date)}
              >
                ×
              </button>
            </div>
            {toast.detail && <div className="toast-detail">{toast.detail}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
