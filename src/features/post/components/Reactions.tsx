'use client'

import styles from '../styles/Reactions.module.css'
import { PostType } from '@/types/post'
import { Modal } from '@/components/modal/Modal'
import EmojiPicker from '@/components/emoji_picker/EmojiPicker'
import { useReaction } from '../hooks/useReaction'

export default function Reactions({ post: initialPost }: { post: PostType }) {
  const { post, isEmojiMenuOpen, setIsEmojiMenuOpen, isReactionConfirmOpen, setIsReactionConfirmOpen, pendingReactionInput, setPendingReactionInput, confirmModalState, processReaction, handleReact } =
    useReaction(initialPost)

  return (
    <div className={styles.reactions}>
      <div className={styles.content}>
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
