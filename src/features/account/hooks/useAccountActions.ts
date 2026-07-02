import { useState } from 'react'
import { api } from '@/lib/axios'
import { AccountType } from '@/types/account'
import { useAccounts } from '@/providers/AccountsProvider'
import { useToast } from '@/providers/ToastProvider'
import { useCurrentAccount } from '@/providers/CurrentAccountProvider'

type UseAccountActionsOptions = {
  account: AccountType | null
  name_id: string
}

/**
 * アカウントに対する操作（フォロー / ブロック / 通報）と、
 * メニュー・通報モーダルの状態をまとめて扱うフック。
 *
 * 返り値の menuModal / reportModal はそれぞれのモーダルコンポーネントへ
 * そのまま spread できる形にしてある。
 */
export function useAccountActions({ account, name_id }: UseAccountActionsOptions) {
  const { updateAccount } = useAccounts()
  const { addToast } = useToast()
  const { currentAccountStatus, currentAccount } = useCurrentAccount()

  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [reportCategory, setReportCategory] = useState('spam')
  const [reportDetail, setReportDetail] = useState('')
  const [isBlockingSubmitting, setIsBlockingSubmitting] = useState(false)
  const [isReportingSubmitting, setIsReportingSubmitting] = useState(false)

  const handleFollow = async () => {
    if (!account) return

    const isFollowing = account.is_following
    const originalFollowersCount = account.followers_count || 0

    // Optimistic update
    updateAccount(name_id, {
      is_following: !isFollowing,
      followers_count: isFollowing ? originalFollowersCount - 1 : originalFollowersCount + 1,
    })

    try {
      if (isFollowing) {
        await api.delete(`/accounts/${account.aid}/follow`)
      } else {
        await api.post(`/accounts/${account.aid}/follow`)
      }
    } catch {
      // Revert on error
      updateAccount(name_id, {
        is_following: isFollowing,
        followers_count: originalFollowersCount,
      })
      addToast({
        message: 'エラー',
        detail: 'フォロー操作に失敗しました',
      })
    }
  }

  const handleMenu = () => {
    setIsMenuModalOpen(true)
  }

  const handleBlock = async () => {
    if (!account || currentAccountStatus !== 'signed_in' || isBlockingSubmitting) return

    const isBlocking = !!account.is_blocking

    updateAccount(name_id, {
      is_blocking: !isBlocking,
    })

    setIsBlockingSubmitting(true)
    try {
      if (isBlocking) {
        await api.delete(`/accounts/${account.aid}/block`)
      } else {
        await api.post(`/accounts/${account.aid}/block`)
      }

      addToast({
        message: isBlocking ? 'ブロックを解除しました' : 'ブロックしました',
      })
      setIsMenuModalOpen(false)
    } catch (error) {
      updateAccount(name_id, {
        is_blocking: isBlocking,
      })
      addToast({
        message: 'エラー',
        detail: error instanceof Error ? error.message : isBlocking ? 'ブロック解除に失敗しました' : 'ブロックに失敗しました',
      })
    } finally {
      setIsBlockingSubmitting(false)
    }
  }

  const executeReport = async () => {
    if (!account || currentAccountStatus !== 'signed_in' || isReportingSubmitting) return

    setIsReportingSubmitting(true)
    try {
      await api.post('/reports', {
        report: {
          target_type: 'account',
          target_aid: account.aid,
          category: reportCategory,
          description: reportDetail,
        },
      })
      addToast({ message: '通報しました' })
      setReportCategory('spam')
      setReportDetail('')
      setIsReportModalOpen(false)
      setIsMenuModalOpen(false)
    } catch (error) {
      addToast({
        message: '通報に失敗しました',
        detail: error instanceof Error ? error.message : String(error),
      })
    } finally {
      setIsReportingSubmitting(false)
    }
  }

  const handleReport = () => {
    if (!account || currentAccountStatus !== 'signed_in') return
    setIsReportModalOpen(true)
  }

  // 自分以外のサインイン済みユーザーに対してのみブロック・通報を許可する
  const canModerate = currentAccountStatus === 'signed_in' && !!account && currentAccount?.aid !== account.aid

  return {
    handleFollow,
    handleMenu,
    menuModal: {
      isOpen: isMenuModalOpen,
      onClose: () => setIsMenuModalOpen(false),
      aid: account?.aid ?? '',
      canModerate,
      isBlocking: !!account?.is_blocking,
      isBlockingSubmitting,
      onBlock: handleBlock,
      onReport: handleReport,
    },
    reportModal: {
      isOpen: isReportModalOpen,
      onClose: () => setIsReportModalOpen(false),
      category: reportCategory,
      onCategoryChange: setReportCategory,
      detail: reportDetail,
      onDetailChange: setReportDetail,
      submitting: isReportingSubmitting,
      onSubmit: executeReport,
    },
  }
}
