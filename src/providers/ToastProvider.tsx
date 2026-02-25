"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  Dispatch,
  SetStateAction,
} from "react";

import { ToastType } from "@/types/toast";

type ToastContextType = {
  toasts: ToastType[];
  setToasts: Dispatch<SetStateAction<ToastType[]>>;
  addToast: (toast: Pick<ToastType, "message" | "detail">) => void;
  showToasts: ToastType[];
  hideToast: (date: number) => void;
  dismissToast: (date: number) => void;
  pauseToasts: () => void;
  resumeToasts: () => void;
  isPaused: boolean;
};

const ToastContext = createContext<ToastContextType | null>(null);

const TOAST_DURATION_MS = 3000;
const TOAST_HIDE_ANIMATION_MS = 250;

type ToastTimerEntry = {
  startedAt: number;
  remainingMs: number;
  timeoutId: ReturnType<typeof setTimeout> | null;
  removalTimeoutId: ReturnType<typeof setTimeout> | null;
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<ToastType[]>([]);
  const [isPaused, setIsPaused] = useState(false);

  const timersRef = useRef<Map<number, ToastTimerEntry>>(new Map());
  const toastsRef = useRef<ToastType[]>([]);
  const isPausedRef = useRef(false);

  useEffect(() => {
    toastsRef.current = toasts;
  }, [toasts]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      // cleanup
      for (const entry of timers.values()) {
        if (entry.timeoutId) clearTimeout(entry.timeoutId);
        if (entry.removalTimeoutId) clearTimeout(entry.removalTimeoutId);
      }
      timers.clear();
    };
  }, []);

  const removeToast = useCallback((date: number) => {
    setToasts((prev) => prev.filter((t) => t.date !== date));
    const entry = timersRef.current.get(date);
    if (entry?.timeoutId) clearTimeout(entry.timeoutId);
    if (entry?.removalTimeoutId) clearTimeout(entry.removalTimeoutId);
    timersRef.current.delete(date);
  }, []);

  const scheduleRemoval = useCallback(
    (date: number) => {
      const entry = timersRef.current.get(date);
      if (!entry) return;
      if (entry.removalTimeoutId) return;
      entry.removalTimeoutId = setTimeout(() => {
        removeToast(date);
      }, TOAST_HIDE_ANIMATION_MS);
    },
    [removeToast]
  );

  const stopTimer = useCallback((date: number) => {
    const entry = timersRef.current.get(date);
    if (!entry) return;
    if (!entry.timeoutId) return;

    clearTimeout(entry.timeoutId);
    entry.timeoutId = null;
    const elapsed = Date.now() - entry.startedAt;
    entry.remainingMs = Math.max(0, entry.remainingMs - elapsed);
  }, []);

  const startTimer = useCallback(
    (date: number) => {
      const entry = timersRef.current.get(date);
      if (!entry) return;
      if (isPausedRef.current) return;
      if (entry.timeoutId) return;

      if (entry.remainingMs <= 0) {
        // already expired
        setToasts((prev) =>
          prev.map((t) => (t.date === date ? { ...t, status: "hide" } : t))
        );
        scheduleRemoval(date);
        return;
      }

      entry.startedAt = Date.now();
      entry.timeoutId = setTimeout(() => {
        setToasts((prev) =>
          prev.map((t) => (t.date === date ? { ...t, status: "hide" } : t))
        );
        scheduleRemoval(date);
      }, entry.remainingMs);
    },
    [scheduleRemoval]
  );

  const hideToast = useCallback(
    (date: number) => {
      stopTimer(date);
      setToasts((prev) =>
        prev.map((toast) =>
          toast.date === date ? { ...toast, status: "hide" } : toast
        )
      );
      scheduleRemoval(date);
    },
    [scheduleRemoval, stopTimer]
  );

  const dismissToast = useCallback(
    (date: number) => {
      hideToast(date);
    },
    [hideToast]
  );

  const addToast = useCallback(
    (toast: { message: string; detail?: string }) => {
      const newToast: ToastType = {
        ...toast,
        status: "show" as const,
        date: Date.now(),
      };

      setToasts((prev) => [...prev, newToast]);

      // initialize timer state
      timersRef.current.set(newToast.date, {
        startedAt: Date.now(),
        remainingMs: TOAST_DURATION_MS,
        timeoutId: null,
        removalTimeoutId: null,
      });

      // start countdown (respects pause)
      startTimer(newToast.date);
    },
    [startTimer]
  );

  const pauseToasts = useCallback(() => {
    if (isPausedRef.current) return;
    isPausedRef.current = true;
    setIsPaused(true);
    for (const date of timersRef.current.keys()) {
      stopTimer(date);
    }
  }, [stopTimer]);

  const resumeToasts = useCallback(() => {
    if (!isPausedRef.current) return;
    isPausedRef.current = false;
    setIsPaused(false);

    for (const toast of toastsRef.current) {
      if (toast.status !== "show") continue;
      startTimer(toast.date);
    }
  }, [startTimer]);

  const showToasts = useMemo(() => toasts, [toasts]);

  const value: ToastContextType = {
    toasts,
    setToasts,
    addToast,
    showToasts,
    hideToast,
    dismissToast,
    pauseToasts,
    resumeToasts,
    isPaused,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
};
