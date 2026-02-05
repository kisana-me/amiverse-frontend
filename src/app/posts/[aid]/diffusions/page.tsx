"use client";

import MainHeader from "@/components/main_header/MainHeader";
import Account from "@/components/Account/OneLine";
import { api } from "@/lib/axios";
import { AccountType } from "@/types/account";
import { use, useCallback, useEffect, useState } from "react";
import { useCurrentAccount } from "@/app/providers/CurrentAccountProvider";

type Props = {
  params: Promise<{
    aid: string;
  }>;
};

export default function Page({ params }: Props) {
  const { aid } = use(params);
  const { currentAccountStatus } = useCurrentAccount();
  const [accounts, setAccounts] = useState<AccountType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchDiffusions = useCallback(() => {
    if (currentAccountStatus === "loading") return;
    setLoading(true);
    api.post('/posts/' + aid + '/diffusions').then((res: any) => {
      setAccounts(res.data.accounts);
    }).catch(() => {
      // Handle error
    }).finally(() => {
      setLoading(false);
    });
  }, [aid, currentAccountStatus]);

  useEffect(() => {
    fetchDiffusions();
  }, [fetchDiffusions, currentAccountStatus]);

  return (
    <>
      <MainHeader>拡散したユーザー</MainHeader>
      {loading ? (
        <div className="p-4 text-center text-[var(--inconspicuous-font-color)]">読み込み中...</div>
      ) : (
        <div>
          {accounts.length > 0 ? (
            accounts.map((account) => (
              <Account key={account.aid} account={account} classes="p-1 box-content" />
            ))
          ) : (
            <div className="p-4 text-center text-[var(--inconspicuous-font-color)]">まだ拡散されていません</div>
          )}
        </div>
      )}
    </>
  );
}
