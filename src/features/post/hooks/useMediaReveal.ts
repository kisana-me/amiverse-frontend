import { useCallback, useState } from 'react'

export function useMediaReveal() {
  const [revealOverrides, setRevealOverrides] = useState<Map<string, boolean>>(new Map())

  const setReveal = useCallback((aid: string, next: boolean) => {
    setRevealOverrides((prev) => {
      if (prev.get(aid) === next) return prev
      const updated = new Map(prev)
      updated.set(aid, next)
      return updated
    })
  }, [])

  return { revealOverrides, setReveal }
}
