import { useState } from 'react'
import { Dropdown } from 'Amiverse'

type Visibility = 'public' | 'followers' | 'private'

const visibilityOptions = [
  { value: 'public' as const, label: '全体公開', description: '誰でも見られます' },
  { value: 'followers' as const, label: 'フォロワーのみ', description: '相互のみ表示' },
  { value: 'private' as const, label: '自分のみ', description: '下書きとして保存' },
]

const Trigger = ({ label }: { label: string }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', border: '1px solid var(--border-color)', borderRadius: 999, color: 'var(--font-color)' }}>
    {label} ▾
  </span>
)

const Live = ({ align, disabled }: { align?: 'left' | 'right'; disabled?: boolean }) => {
  const [value, setValue] = useState<Visibility>('public')
  const current = visibilityOptions.find((o) => o.value === value)!
  return (
    <Dropdown options={visibilityOptions} value={value} onSelect={(v) => setValue(v as Visibility)} trigger={<Trigger label={current.label} />} ariaLabel="公開範囲" align={align} disabled={disabled} />
  )
}

export const Default = () => <Live />

export const AlignRight = () => (
  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
    <Live align="right" />
  </div>
)

export const Disabled = () => <Live disabled />
