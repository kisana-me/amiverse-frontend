"use client";

import MainHeader from "@/app/components/main_header/MainHeader";
import { api } from "@/app/lib/axios";
import { AccountType } from "@/types/account";
import { use, useCallback, useEffect, useState } from "react";
import SkeletonItem from "@/app/components/post/skeleton_item";

type Props = {
  params: Promise<{
    name_id: string;
  }>;
};

export default function Page({ params }: Props) {
  const { name_id } = use(params);

  const [loading, setLoading] = useState<boolean>(true);
  const [account, setAccount] = useState<AccountType | null>(null);

  const fetchAccount = useCallback(() => {
    setLoading(true);
    // Assuming the API can handle name_id lookup
    api.get('/accounts/' + name_id).then(res => {
      setAccount(res.data);
    }).catch(() => {
      setAccount(null);
    }).finally(() => {
      setLoading(false);
    });
  }, [name_id]);

  useEffect(() => {
    if (!name_id) return;
    fetchAccount();
  }, [fetchAccount]);

  return (
    <>
      <MainHeader>{account ? account.name : 'Account'}</MainHeader>
      {loading ? <SkeletonItem /> :
        account ? (
            <div className="p-4">
                <h1 className="text-xl font-bold">{account.name} <span className="text-gray-500 text-sm">@{account.name_id}</span></h1>
                <p className="mt-2">{account.description}</p>
            </div>
        ) : <div>アカウントが見つかりません</div>
      }
    </>
  );
}
