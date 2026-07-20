'use client'

import { ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react'
import styles from './dropdown.module.css'

export type DropdownOption<T extends string = string> = {
  value: T
  label: string
  icon?: ReactNode
  description?: string
}

type DropdownProps<T extends string> = {
  options: DropdownOption<T>[]
  value: T
  onSelect: (value: T) => void
  trigger: ReactNode
  disabled?: boolean
  ariaLabel: string
  align?: 'left' | 'right'
}

export default function Dropdown<T extends string>({ options, value, onSelect, trigger, disabled, ariaLabel, align = 'left' }: DropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false)
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLUListElement>(null)

  useLayoutEffect(() => {
    if (!isOpen) {
      setPos(null)
      return
    }
    const triggerEl = triggerRef.current
    const menuEl = menuRef.current
    if (!triggerEl || !menuEl) return
    const t = triggerEl.getBoundingClientRect()
    const width = menuEl.getBoundingClientRect().width
    const margin = 8
    const maxLeft = window.innerWidth - width - margin
    let left = align === 'right' ? t.right - width : t.left
    if (left > maxLeft) left = maxLeft
    if (left < margin) left = margin
    setPos({ top: t.bottom + 4, left })
  }, [isOpen, align])

  useEffect(() => {
    if (!isOpen) return
    const close = () => setIsOpen(false)
    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as Node
      if (rootRef.current?.contains(target) || menuRef.current?.contains(target)) return
      close()
    }
    document.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
    }
  }, [isOpen])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) {
      e.stopPropagation()
      setIsOpen(false)
      triggerRef.current?.focus()
    }
  }

  return (
    <div className={styles.dropdown} ref={rootRef} onKeyDown={handleKeyDown}>
      <button
        type="button"
        ref={triggerRef}
        className={styles.trigger}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {trigger}
      </button>
      {isOpen && (
        <ul ref={menuRef} role="listbox" aria-label={ariaLabel} className={styles.menu} style={pos ? { top: pos.top, left: pos.left } : { visibility: 'hidden' }}>
          {options.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                role="option"
                aria-selected={option.value === value}
                className={`${styles.option} ${option.value === value ? styles.option_selected : ''}`}
                onClick={() => {
                  onSelect(option.value)
                  setIsOpen(false)
                }}
              >
                {option.icon && <span className={styles.option_icon}>{option.icon}</span>}
                <span className={styles.option_body}>
                  <span className={styles.option_label}>{option.label}</span>
                  {option.description && <span className={styles.option_description}>{option.description}</span>}
                </span>
                {option.value === value && (
                  <svg className={styles.option_check} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
