"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useRef,
  useEffect,
} from "react";
import { AccountType } from "@/types/account";
import { api } from "@/app/lib/axios";

export type CachedAccount = AccountType & {
  fetched_at: number;
};

type AccountsContextType = {
  accounts: Record<string, CachedAccount>;
  fetchAccount: (name_id: string) => Promise<AccountType | null>;
  getAccount: (name_id: string) => CachedAccount | undefined;
};

const AccountsContext = createContext<AccountsContextType | null>(null);

export const AccountsProvider = ({ children }: { children: ReactNode }) => {
  const [accounts, setAccounts] = useState<Record<string, CachedAccount>>({});
  const accountsRef = useRef(accounts);

  useEffect(() => {
    accountsRef.current = accounts;
  }, [accounts]);

  const getAccount = useCallback((name_id: string) => {
    return accounts[name_id];
  }, [accounts]);

  const fetchAccount = useCallback(async (name_id: string) => {
    if (accountsRef.current[name_id]) {
      return accountsRef.current[name_id];
    }

    try {
      const res = await api.post('/accounts', { name_id });
      const account = res.data as AccountType;
      
      const cachedAccount: CachedAccount = {
        ...account,
        fetched_at: Date.now(),
      };

      setAccounts((prev) => ({
        ...prev,
        [name_id]: cachedAccount,
      }));

      return cachedAccount;
    } catch {
      return null;
    }
  }, []);

  const value: AccountsContextType = {
    accounts,
    fetchAccount,
    getAccount,
  };

  return (
    <AccountsContext.Provider value={value}>
      {children}
    </AccountsContext.Provider>
  );
};

export const useAccounts = () => {
  const context = useContext(AccountsContext);
  if (!context) {
    throw new Error("useAccounts must be used within an AccountsProvider");
  }
  return context;
};
