import { useRef } from 'react'
import { useRouter } from 'next/navigation'

export function usePostClick(aid: string, stopPropagation: boolean = false) {
  const router = useRouter()
  const pointerDownTime = useRef<number>(0)
  const pointerDownPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 })

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (stopPropagation) e.stopPropagation()

    pointerDownTime.current = Date.now()
    pointerDownPos.current = { x: e.clientX, y: e.clientY }
  }

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (stopPropagation) e.stopPropagation()

    const target = e.target as Element

    // aタグやbuttonなどのインタラクティブ要素をクリックした場合は遷移しない
    if (target.closest('a, button, [role="button"]')) {
      return
    }

    // 長押し判定（500ms以上）
    const duration = Date.now() - pointerDownTime.current
    if (duration > 500) {
      return
    }

    // スクロール時の意図しないクリック判定（10px以上動いた場合）
    if (pointerDownTime.current > 0) {
      const dx = e.clientX - pointerDownPos.current.x
      const dy = e.clientY - pointerDownPos.current.y
      if (Math.sqrt(dx * dx + dy * dy) > 10) {
        return
      }
    }

    // DOMから削除された要素やPortal経由（ビューワーの背景など）のクリックイベントを除外
    if (!document.body.contains(target) || !e.currentTarget.contains(target)) {
      return
    }

    // テキスト選択中の場合は遷移しない
    const selection = window.getSelection()
    if (selection && selection.toString().length > 0) {
      return
    }

    // 新しいタブで開く操作（Ctrl/Cmd + クリック）のサポート
    if (e.ctrlKey || e.metaKey) {
      window.open('/posts/' + aid, '_blank', 'noopener,noreferrer')
      return
    }

    router.push('/posts/' + aid)
  }

  return {
    onClick: handleClick,
    onPointerDown: handlePointerDown,
  }
}
