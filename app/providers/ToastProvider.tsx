"use client";

import {
  createContext,
  useContext,
  useState,
  Dispatch,
  SetStateAction,
} from "react";

type toastType = {
  title: string;
  message: string;
  status: "show" | "hide";
  date: number;
};

type ToastContextType = {
  toasts: toastType[];
  setToasts: Dispatch<SetStateAction<toastType[]>>;
  addToast: (toast: toastType) => void;
  showToasts: toastType[];
  hideToast: (date: number) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<toastType[]>([]);

  function addToast(toast: toastType) {
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => {
      hideToast(toast.date);
    }, 3000);
  }

  const showToasts = toasts.filter((toast) => toast.status === "show");

  const hideToast = (date: number) => {
    setToasts((prev) =>
      prev.map((toast) =>
        toast.date === date ? { ...toast, status: "hide" } : toast
      )
    );
  };

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
