import { Modal } from 'Amiverse'

const noop = () => {}

export const Default = () => (
  <Modal isOpen onClose={noop} title="投稿を削除しますか？">
    <div className="flex flex-col gap-4">
      <p>この投稿は完全に削除され、元に戻せません。</p>
      <div className="flex justify-end gap-2">
        <button className="px-4 py-2 rounded-md">キャンセル</button>
        <button className="px-4 py-2 bg-red-500 text-white rounded-md">削除する</button>
      </div>
    </div>
  </Modal>
)

export const Wide = () => (
  <Modal isOpen onClose={noop} title="リアクションを選択" width="max-w-2xl">
    <div className="flex flex-wrap gap-2">
      {['👍', '🎉', '😂', '😮', '😢', '🔥', '✨', '🙏'].map((e) => (
        <button key={e} className="px-3 py-2 rounded-md border border-gray-300 text-lg">
          {e}
        </button>
      ))}
    </div>
  </Modal>
)
