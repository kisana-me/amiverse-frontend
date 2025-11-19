"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  Dispatch,
  SetStateAction,
} from "react";
import { useOverlay } from "./OverlayProvider";

export type CurrentAccountStatus = "loading" | "signed_out" | "signed_in";

export type CurrentAccount = {
  aid: string;
  name: string;
  name_id: string;
  icon_url: string;
  description: string;
  followers_count: number;
  following_count: number;
  statuses_count: number;
} | null;

export type CurrentAccountState = {
  status: CurrentAccountStatus;
  account: CurrentAccount;
};

type CurrentAccountContextType = {
  currentAccountState: CurrentAccountState;
  setCurrentAccountState: Dispatch<SetStateAction<CurrentAccountState>>;
};

export const CurrentAccountContext = createContext<CurrentAccountContextType | null>(null);

export function CurrentAccountProvider({ children }: { children: React.ReactNode }) {
  const { setInitOverlay, doneInitLoading } = useOverlay();
  const [currentAccountState, setCurrentAccountState] = useState<CurrentAccountState>({
    status: "loading",
    account: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      setInitOverlay({
        is_loading: true,
        loading_message: "問い合わせ中",
        loading_progress: 50,
      });
      try {
        const res = await fetch("/api/start");
        const data = await res.json();

        if (data?.account) {
            setCurrentAccountState({
              status: "signed_in",
              account: data.account,
            });
        } else {
          setCurrentAccountState({
            status: "signed_out",
            account: null,
          });
        }
      } catch (error) {
        // toast
        setCurrentAccountState({
          status: "signed_out",
          account: null,
        });
      }
      doneInitLoading();
    };

    fetchData();
  }, []);

  const value: CurrentAccountContextType = {
    currentAccountState,
    setCurrentAccountState,
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
