'use client'

import { useRef } from 'react'
import styles from '../styles/Reactions.module.css'
import { PostType } from '@/types/post'
import { Modal } from '@/components/modal/Modal'
import EmojiPicker from '@/components/emoji_picker/EmojiPicker'
import { useReaction } from '../hooks/useReaction'

export default function Reactions({ post: initialPost }: { post: PostType }) {
  const emojiButtonRef = useRef(null)
  const { post, isEmojiMenuOpen, setIsEmojiMenuOpen, isReactionConfirmOpen, setIsReactionConfirmOpen, pendingReactionInput, setPendingReactionInput, confirmModalState, processReaction, handleReact } =
    useReaction(initialPost)

  return (
    <div className={styles.reactions}>
      <div className={styles.content}>
        <button ref={emojiButtonRef} className={`${styles.button} ${post.is_reacted ? styles.button_reacted : ''}`} onClick={() => setIsEmojiMenuOpen(true)}>
          <div className={styles.icon}>
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M76 11H70V24H57V30H70V43H76V30H89V24H76V11ZM50 27C50 21.5581 51.8899 16.5576 55.0492 12.6192C52.7609 12.2123 50.4052 12 48 12C25.9086 12 8 29.9086 8 52C8 74.0914 25.9086 92 48 92C70.0914 92 88 74.0914 88 52C88 49.5948 87.7877 47.2391 87.3808 44.9508C83.4424 48.1101 78.4419 50 73 50C60.2975 50 50 39.7025 50 27ZM36 34C32.6863 34 30 36.6863 30 40C30 43.3137 32.6863 46 36 46C39.3137 46 42 43.3137 42 40C42 36.6863 39.3137 34 36 34ZM32.8247 59C32.3692 59 32 59.3693 32 59.8247C32 68.2058 38.7942 75 47.1753 75H51.8247C60.2058 75 67 68.2058 67 59.8247C67 59.3693 66.6308 59 66.1753 59H32.8247Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <div className={styles.number}>{post.reactions_count}</div>
        </button>

        <Modal isOpen={isEmojiMenuOpen} onClose={() => setIsEmojiMenuOpen(false)} title="リアクションを選択" width="max-w-sm">
          <EmojiPicker onEmojiSelect={handleReact} />
        </Modal>

        <Modal isOpen={isReactionConfirmOpen} onClose={() => setIsReactionConfirmOpen(false)} title={confirmModalState.title} width="max-w-sm">
          <div className="flex flex-col gap-4">
            <p>{confirmModalState.message}</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsReactionConfirmOpen(false)} className="px-4 py-2 rounded-md hover:bg-gray-100 transition-colors">
                キャンセル
              </button>
              <button
                onClick={() => {
                  if (pendingReactionInput) {
                    processReaction(pendingReactionInput)
                  }
                  setIsReactionConfirmOpen(false)
                  setPendingReactionInput(null)
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                {confirmModalState.actionText}
              </button>
            </div>
          </div>
        </Modal>
      </div>

      <div className={styles.content}>
        {post?.reactions &&
          post.reactions.map((emoji) => (
            <button className={`${styles.button} ${emoji.reacted ? styles.button_reacted : ''}`} key={emoji.name_id} onClick={() => handleReact(emoji.name_id)}>
              <div className={styles.emoji}>{emoji.name}</div>
              <div className={styles.number}>{emoji.reactions_count}</div>
            </button>
          ))}
      </div>
    </div>
  )
}
