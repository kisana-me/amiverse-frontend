import { useState } from 'react'
import { PostType } from '@/types/post'
import { EmojiType } from '@/types/emoji'
import { usePosts } from '@/providers/PostsProvider'
import { useEmoji } from '@/providers/EmojiProvider'
import { addReaction, removeReaction } from '../api/reaction'

export const useReaction = (initialPost: PostType) => {
  const [isEmojiMenuOpen, setIsEmojiMenuOpen] = useState(false)
  const [isReactionConfirmOpen, setIsReactionConfirmOpen] = useState(false)
  const [pendingReactionInput, setPendingReactionInput] = useState<EmojiType | string | null>(null)
  const [confirmModalState, setConfirmModalState] = useState({
    title: 'リアクションを解除',
    message: 'リアクションを解除しますか？',
    actionText: '解除する',
  })
  const [post, setPost] = useState(initialPost)
  const [prevInitialPost, setPrevInitialPost] = useState(initialPost)
  const { addPosts } = usePosts()
  const { getEmoji } = useEmoji()

  if (initialPost !== prevInitialPost) {
    setPost(initialPost)
    setPrevInitialPost(initialPost)
  }

  const processReaction = async (emojiInput: EmojiType | string) => {
    const emojiNameId = typeof emojiInput === 'string' ? emojiInput : emojiInput.name_id

    const currentReaction = post.reactions?.find((r) => r.reacted)
    const isRemoving = currentReaction?.name_id === emojiNameId

    const prevPost = { ...post }
    const newPost = { ...post }
    newPost.reactions = newPost.reactions ? [...newPost.reactions] : []

    if (currentReaction) {
      const idx = newPost.reactions.findIndex((r) => r.name_id === currentReaction.name_id)
      if (idx !== -1) {
        newPost.reactions[idx] = {
          ...newPost.reactions[idx],
          reactions_count: Math.max(0, (newPost.reactions[idx].reactions_count || 0) - 1),
          reacted: false,
        }
        if (newPost.reactions[idx].reactions_count === 0) {
          newPost.reactions.splice(idx, 1)
        }
      }
      newPost.reactions_count = Math.max(0, (newPost.reactions_count || 0) - 1)
      newPost.is_reacted = false
    }

    if (!isRemoving) {
      const idx = newPost.reactions.findIndex((r) => r.name_id === emojiNameId)
      if (idx !== -1) {
        newPost.reactions[idx] = {
          ...newPost.reactions[idx],
          reactions_count: (newPost.reactions[idx].reactions_count || 0) + 1,
          reacted: true,
        }
      } else {
        const emojiData = typeof emojiInput === 'object' ? emojiInput : await getEmoji(emojiInput)
        if (emojiData) {
          newPost.reactions.push({
            ...emojiData,
            reactions_count: 1,
            reacted: true,
          })
        }
      }
      newPost.reactions_count = (newPost.reactions_count || 0) + 1
      newPost.is_reacted = true
    }

    setPost(newPost)
    addPosts([newPost])

    try {
      if (isRemoving) {
        await removeReaction(post.aid)
      } else {
        await addReaction(post.aid, emojiNameId)
      }
    } catch (error) {
      console.error('Reaction failed', error)
      setPost(prevPost)
      addPosts([prevPost])
    }
  }

  const handleReact = (emojiInput: EmojiType | string) => {
    setIsEmojiMenuOpen(false)

    const emojiNameId = typeof emojiInput === 'string' ? emojiInput : emojiInput.name_id
    const currentReaction = post.reactions?.find((r) => r.reacted)

    if (currentReaction) {
      setPendingReactionInput(emojiInput)
      if (currentReaction.name_id === emojiNameId) {
        setConfirmModalState({
          title: 'リアクションを解除',
          message: 'リアクションを解除しますか？',
          actionText: '解除する',
        })
      } else {
        setConfirmModalState({
          title: 'リアクションを変更',
          message: 'リアクションを変更しますか？',
          actionText: '変更する',
        })
      }
      setIsReactionConfirmOpen(true)
    } else {
      if (emojiInput) {
        processReaction(emojiInput)
      }
    }
  }

  return {
    post,
    isEmojiMenuOpen,
    setIsEmojiMenuOpen,
    isReactionConfirmOpen,
    setIsReactionConfirmOpen,
    pendingReactionInput,
    setPendingReactionInput,
    confirmModalState,
    processReaction,
    handleReact,
  }
}
