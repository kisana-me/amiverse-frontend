import { useState } from 'react'
import { PostType } from '@/types/post'
import { useCurrentAccount } from '@/providers/CurrentAccountProvider'
import { usePosts } from '@/providers/PostsProvider'
import { useToast } from '@/providers/ToastProvider'
import { deletePost as deletePostApi, addDiffuse, removeDiffuse, reportPost } from '../api/console'

export const useConsole = (initialPost: PostType) => {
  const [isPostMenuOpen, setIsPostMenuOpen] = useState(false)
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false)
  const [isDiffuseConfirmOpen, setIsDiffuseConfirmOpen] = useState(false)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [reportCategory, setReportCategory] = useState('spam')
  const [reportDetail, setReportDetail] = useState('')

  const [post, setPost] = useState(initialPost)
  const [prevInitialPost, setPrevInitialPost] = useState(initialPost)

  const { currentAccountStatus, currentAccount } = useCurrentAccount()
  const { addPosts, removePost } = usePosts()
  const { addToast } = useToast()

  if (initialPost !== prevInitialPost) {
    setPost(initialPost)
    setPrevInitialPost(initialPost)
  }

  const handleAction = (action: () => void) => {
    if (currentAccountStatus !== 'signed_in') {
      setIsSignInModalOpen(true)
      return
    }
    action()
  }

  const handleDelete = async () => {
    if (!confirm('本当に削除しますか？')) return

    try {
      await deletePostApi(post.aid)
      removePost(post.aid)
      setIsPostMenuOpen(false)
      addToast({ message: '投稿を削除しました' })
    } catch (error) {
      console.error('Delete failed', error)
      addToast({ message: '削除に失敗しました' })
    }
  }

  const executeDiffuse = async () => {
    const prevPost = { ...post }
    const newPost = { ...post }

    if (post.is_diffused) {
      newPost.diffuses_count = Math.max(0, post.diffuses_count - 1)
      newPost.is_diffused = false
    } else {
      newPost.diffuses_count = post.diffuses_count + 1
      newPost.is_diffused = true
    }

    setPost(newPost)
    addPosts([newPost])

    try {
      if (prevPost.is_diffused) {
        await removeDiffuse(post.aid)
      } else {
        await addDiffuse(post.aid)
      }
    } catch (error) {
      console.error('Diffuse failed', error)
      setPost(prevPost)
      addPosts([prevPost])
    }
  }

  const handleDiffuse = () => {
    handleAction(() => {
      if (post.is_diffused) {
        setIsDiffuseConfirmOpen(true)
      } else {
        executeDiffuse()
      }
    })
  }

  const executeReport = async () => {
    try {
      await reportPost(post.aid, reportCategory, reportDetail)
      addToast({ message: '通報しました' })
      setReportCategory('spam')
      setReportDetail('')
    } catch (error) {
      console.error('Report failed', error)
      addToast({ message: '通報に失敗しました' })
    } finally {
      setIsReportModalOpen(false)
      setIsPostMenuOpen(false)
    }
  }

  const handleReport = () => {
    handleAction(() => {
      setIsReportModalOpen(true)
    })
  }

  return {
    post,
    currentAccount,
    currentAccountStatus,
    isPostMenuOpen,
    setIsPostMenuOpen,
    isSignInModalOpen,
    setIsSignInModalOpen,
    isDiffuseConfirmOpen,
    setIsDiffuseConfirmOpen,
    isReportModalOpen,
    setIsReportModalOpen,
    reportCategory,
    setReportCategory,
    reportDetail,
    setReportDetail,
    handleAction,
    handleDelete,
    executeDiffuse,
    handleDiffuse,
    executeReport,
    handleReport,
  }
}
