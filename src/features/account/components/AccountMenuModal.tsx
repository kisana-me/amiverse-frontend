'use client'

import { Modal } from '@/components/modal/Modal'

type Props = {
  isOpen: boolean
  onClose: () => void
  aid: string
  canModerate: boolean
  isBlocking: boolean
  isBlockingSubmitting: boolean
  onBlock: () => void
  onReport: () => void
}

export default function AccountMenuModal({ isOpen, onClose, aid, canModerate, isBlocking, isBlockingSubmitting, onBlock, onReport }: Props) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="アカウントメニュー">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div>アカウントのID: {aid}</div>

        {canModerate && (
          <>
            <button
              onClick={onBlock}
              disabled={isBlockingSubmitting}
              style={{
                color: 'red',
                cursor: isBlockingSubmitting ? 'not-allowed' : 'pointer',
                opacity: isBlockingSubmitting ? 0.7 : 1,
                padding: '8px',
                border: '1px solid red',
                borderRadius: '4px',
                background: 'transparent',
              }}
            >
              {isBlocking ? 'アカウントのブロックを解除' : 'アカウントをブロック'}
            </button>
            <button
              onClick={onReport}
              style={{
                color: 'red',
                cursor: 'pointer',
                padding: '8px',
                border: '1px solid red',
                borderRadius: '4px',
                background: 'transparent',
              }}
            >
              アカウントを通報
            </button>
          </>
        )}
      </div>
    </Modal>
  )
}
