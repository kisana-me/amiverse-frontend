"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  Dispatch,
  SetStateAction,
  useCallback,
} from "react";
import { api } from "@/app/lib/axios";
import { useOverlay } from "./OverlayProvider";
import { useToast } from "./ToastProvider";

export type CurrentAccountStatus = "loading" | "signed_out" | "signed_in";

export type CurrentAccount = {
  aid: string;
  name: string;
  name_id: string;
  icon_url: string;
  banner_url?: string;
  description: string;
  birthdate?: string;
  followers_count: number;
  following_count: number;
  posts_count: number;
} | null;

type CurrentAccountContextType = {
  currentAccount: CurrentAccount;
  setCurrentAccount: Dispatch<SetStateAction<CurrentAccount>>;
  currentAccountStatus: CurrentAccountStatus;
  setCurrentAccountStatus: Dispatch<SetStateAction<CurrentAccountStatus>>;
};

export const CurrentAccountContext = createContext<CurrentAccountContextType | null>(null);

export function CurrentAccountProvider({ children }: { children: React.ReactNode }) {
  const { setInitOverlay, doneInitLoading } = useOverlay();
  const { addToast } = useToast();
  const [ currentAccount, setCurrentAccount ] = useState<CurrentAccount>(null);
  const [ currentAccountStatus, setCurrentAccountStatus ] = useState<CurrentAccountStatus>("loading");

  const fetchCurrentAccount = useCallback(async () => {
    setInitOverlay({
      is_loading: true,
      loading_message: "問い合わせ中",
      loading_progress: 50,
    });
    try {
      const res = await api.get("/start");
      if (res.data?.account) {
        setCurrentAccount(res.data.account);
        setCurrentAccountStatus("signed_in");
      } else {
        setCurrentAccount(null);
        setCurrentAccountStatus("signed_out");
      }
      if (res.data?.csrf_token) {
        api.defaults.headers.common["X-CSRF-Token"] = res.data.csrf_token;
      } else {
        addToast({
          title: "情報取得エラー",
          message: "CSRFトークンの取得に失敗しました",
        });
      }
    } catch (error) {
      addToast({
        title: "アカウント情報取得エラー",
        message: error instanceof Error ? error.message : String(error),
      });
      setCurrentAccount(null);
      setCurrentAccountStatus("signed_out");
    } finally {
      doneInitLoading();
    }
  }, [setInitOverlay, doneInitLoading, addToast]);

  useEffect(() => {
    async function load() {
      try {
        await fetchCurrentAccount();
      } catch (error) {
        // fetchCurrentAccount already handles errors internally, but catch any unexpected errors
        console.error('[CurrentAccountProvider] Unexpected error during initial account fetch:', error);
        addToast({
          title: "初期化エラー",
          message: "アカウント情報の読み込みに失敗しました",
        });
      }
    }
    load();
    // Note: fetchCurrentAccount is intentionally not in deps as we want this to run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value: CurrentAccountContextType = {
    currentAccount,
    setCurrentAccount,
    currentAccountStatus,
    setCurrentAccountStatus,
  };

  return (
    <CurrentAccountContext.Provider value={value}>
      {children}
    </CurrentAccountContext.Provider>
  );
};

export function useCurrentAccount() {
  const context = useContext(CurrentAccountContext);
  if (!context) throw new Error("useCurrentAccount must be used within a CurrentAccountProvider");
  return context;
};
