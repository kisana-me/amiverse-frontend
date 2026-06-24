'use client'

import MainHeader from '@/components/main_header/MainHeader'
import Account from '@/components/Account/OneLine'
import { api } from '@/lib/axios'
import { AccountType } from '@/types/account'
import { use, useEffect, useRef, useState } from 'react'
import { useCurrentAccount } from '@/providers/CurrentAccountProvider'
import { useToast } from '@/providers/ToastProvider'

type Props = {
  params: Promise<{
    aid: string
  }>
}

export default function Page({ params }: Props) {
  const { aid } = use(params)
  const { currentAccountStatus } = useCurrentAccount()
  const { addToast } = useToast()
  const [accounts, setAccounts] = useState<AccountType[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const cancelledRef = useRef(false)

  useEffect(() => {
    if (currentAccountStatus === 'loading') return
    if (cancelledRef.current) return
    cancelledRef.current = true

    api
      .post(`/posts/${aid}/diffusions`)
      .then((res) => {
        setAccounts(res.data.accounts)
      })
      .catch(() => {
        addToast({ message: '拡散したアカウントの取得に失敗しました' })
      })
      .finally(() => {
        setLoading(false)
      })
  }, [aid, currentAccountStatus, addToast])

  return (
    <>
      <MainHeader>拡散したアカウント</MainHeader>
      {loading ? (
        <div className="p-4 text-center text-[var(--inconspicuous-font-color)]">読み込み中...</div>
      ) : (
        <div>
          {accounts.length > 0 ? (
            accounts.map((account) => <Account key={account.aid} account={account} classes="p-1 box-content" />)
          ) : (
            <div className="p-4 text-center text-[var(--inconspicuous-font-color)]">まだ拡散されていません</div>
          )}
        </div>
      )}
    </>
  )
}
