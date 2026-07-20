'use client'

import Image from 'next/image'
import { useLayoutEffect, useRef } from 'react'
import Dropdown, { DropdownOption } from '@/components/dropdown/Dropdown'
import DrawingEditor from '@/components/post/DrawingEditor'
import { useCurrentAccount } from '@/providers/CurrentAccountProvider'
import { PostType } from '@/types/post'
import { FormRating, FormVisibility } from '../api/posts'
import { usePostForm } from '../hooks/usePostForm'
import MediaList from './MediaList'
import DrawingPreview from './DrawingPreview'
import styles from '../styles/PostForm.module.css'

const GlobeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
)

const FollowersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

const RatingIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)

const visibilityOptions: DropdownOption<FormVisibility>[] = [
  { value: 'opened', label: '全体公開', icon: <GlobeIcon />, description: 'すべてのアカウントに表示されます' },
  { value: 'limited', label: 'フォロワー', icon: <FollowersIcon />, description: 'フォロワーのみに表示されます' },
]

const ratingOptions: DropdownOption<FormRating>[] = [
  { value: 'general', label: '全年齢' },
  { value: 'nsfw', label: 'センシティブ' },
  { value: 'r18', label: 'R-18' },
]

type Props = {
  replyPost?: PostType
  quotePost?: PostType
  communityAid?: string
  onSuccess?: (post: PostType) => void
  placeholder?: string
}

export default function PostForm({ replyPost, quotePost, communityAid, onSuccess, placeholder = 'いまどうしてる？' }: Props) {
  const { currentAccount } = useCurrentAccount()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const {
    content,
    setContent,
    visibility,
    setVisibility,
    rating,
    setRating,
    mediaItems,
    drawing,
    isSubmitting,
    isDrawingOpen,
    setIsDrawingOpen,
    canSubmit,
    addFiles,
    handleFileChange,
    updateMediaItem,
    removeMedia,
    handleDrawingSave,
    updateDrawing,
    removeDrawing,
    handleSubmit,
  } = usePostForm({ replyAid: replyPost?.aid, quoteAid: quotePost?.aid, communityAid, onSuccess })

  const currentVisibility = visibilityOptions.find((option) => option.value === visibility) || visibilityOptions[0]
  const currentRating = ratingOptions.find((option) => option.value === rating) || ratingOptions[0]

  useLayoutEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }, [content])

  const handlePaste = (e: React.ClipboardEvent) => {
    const files = Array.from(e.clipboardData.files)
    if (files.length > 0) {
      e.preventDefault()
      addFiles(files)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className={styles.form}>
      <div className={styles.left}>
        <Image className={styles.account_icon} src={currentAccount?.icon_url || '/ast-imgs/icon.png'} alt={currentAccount?.name || ''} width={40} height={40} unoptimized />
      </div>
      <div className={styles.right}>
        <textarea
          ref={textareaRef}
          className={styles.textarea}
          placeholder={placeholder}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          disabled={isSubmitting}
        />
        {drawing && <DrawingPreview drawing={drawing} disabled={isSubmitting} onUpdate={updateDrawing} onRemove={removeDrawing} />}
        <MediaList mediaItems={mediaItems} disabled={isSubmitting} onUpdateMedia={updateMediaItem} onRemoveMedia={removeMedia} />
        <div className={styles.toolbar}>
          <label className={`${styles.tool_button} ${isSubmitting ? styles.tool_button_disabled : ''}`} title="画像/動画を追加">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple accept="image/*,video/*" className={styles.file_input} disabled={isSubmitting} />
          </label>
          <button type="button" className={styles.tool_button} onClick={() => setIsDrawingOpen(true)} title="お絵描き" disabled={isSubmitting}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19l7-7 3 3-7 7-3-3z" />
              <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
            </svg>
          </button>
          <Dropdown
            options={visibilityOptions}
            value={visibility}
            onSelect={setVisibility}
            disabled={isSubmitting}
            ariaLabel="公開範囲"
            trigger={
              <span className={styles.trigger_content} title="公開範囲">
                {currentVisibility.icon}
                <span className={styles.trigger_label}>{currentVisibility.label}</span>
              </span>
            }
          />
          <Dropdown
            options={ratingOptions}
            value={rating}
            onSelect={setRating}
            disabled={isSubmitting}
            ariaLabel="レーティング"
            trigger={
              <span className={styles.trigger_content} title="レーティング">
                <RatingIcon />
                <span className={styles.trigger_label}>{currentRating.label}</span>
              </span>
            }
          />
          <button type="button" className={styles.submit} onClick={handleSubmit} disabled={!canSubmit}>
            {isSubmitting ? '送信中...' : '投稿'}
          </button>
        </div>
      </div>
      {isDrawingOpen && (
        <DrawingEditor onClose={() => setIsDrawingOpen(false)} onSave={handleDrawingSave} initialData={drawing?.packed} initialName={drawing?.name} initialDescription={drawing?.description} />
      )}
    </div>
  )
}
