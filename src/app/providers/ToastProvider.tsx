"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  Dispatch,
  SetStateAction,
} from "react";

type ToastType = {
  title: string;
  message: string;
  status: "show" | "hide";
  date: number;
};

type ToastContextType = {
  toasts: ToastType[];
  setToasts: Dispatch<SetStateAction<ToastType[]>>;
  addToast: (toast: Pick<ToastType, "title" | "message">) => void;
  showToasts: ToastType[];
  hideToast: (date: number) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<ToastType[]>([]);

  const hideToast = useCallback((date: number) => {
    setToasts((prev) =>
      prev.map((toast) =>
        (toast.date === date ? { ...toast, status: "hide" } : toast)
      )
    );
  }, []);

  const addToast = useCallback((toast: {title: string; message: string;}) => {
    const newToast: ToastType = {
      ...toast,
      status: "show" as const,
      date: Date.now(),
    };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      hideToast(newToast.date);
    }, 3000);
  }, [hideToast]);

  const showToasts = toasts.filter((toast) => toast.status === "show");

  const value: ToastContextType = {
    toasts,
    setToasts,
    addToast,
    showToasts,
    hideToast,
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
