import { useState } from 'react'
import { useToast } from '@/providers/ToastProvider'
import { useFeeds } from '@/providers/FeedsProvider'
import { usePosts } from '@/providers/PostsProvider'
import { PostType } from '@/types/post'
import { createPost, DrawingData, FormRating, FormVisibility, MediaItem } from '../api/posts'

type UsePostFormParams = {
  replyAid?: string
  quoteAid?: string
  communityAid?: string
  onSuccess?: (post: PostType) => void
}

export const usePostForm = ({ replyAid, quoteAid, communityAid, onSuccess }: UsePostFormParams) => {
  const { prependFeedItem } = useFeeds()
  const { addPosts } = usePosts()
  const { addToast } = useToast()

  const [content, setContent] = useState('')
  const [visibility, setVisibility] = useState<FormVisibility>('opened')
  const [rating, setRating] = useState<FormRating>('general')
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [drawing, setDrawing] = useState<DrawingData | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDrawingOpen, setIsDrawingOpen] = useState(false)

  const canSubmit = !isSubmitting && (content.trim() !== '' || mediaItems.length > 0 || drawing !== null)

  const addFiles = (files: File[]) => {
    const media = files.filter((file) => file.type.startsWith('image/') || file.type.startsWith('video/'))
    if (media.length === 0) return
    if (mediaItems.length + media.length > 8) {
      addToast({ message: 'エラー', detail: '画像・動画は最大8個までです' })
      return
    }
    const newItems: MediaItem[] = media.map((file) => ({ file, url: URL.createObjectURL(file), rating: 'general', name: '', description: '' }))
    setMediaItems((items) => [...items, ...newItems])
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    addFiles(Array.from(e.target.files))
    e.target.value = ''
  }

  const updateMediaItem = (index: number, patch: Partial<MediaItem>) => {
    setMediaItems((items) => items.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  }

  const removeMedia = (index: number) => {
    setMediaItems((items) => {
      const target = items[index]
      if (target) URL.revokeObjectURL(target.url)
      return items.filter((_, i) => i !== index)
    })
  }

  const handleDrawingSave = (blob: Blob, packed: string, name: string, description: string) => {
    if (drawing) URL.revokeObjectURL(drawing.previewUrl)
    setDrawing({ blob, packed, previewUrl: URL.createObjectURL(blob), name, description, rating: drawing?.rating || 'general' })
    setIsDrawingOpen(false)
  }

  const updateDrawing = (patch: Partial<DrawingData>) => {
    setDrawing((current) => (current ? { ...current, ...patch } : current))
  }

  const removeDrawing = () => {
    if (drawing) {
      URL.revokeObjectURL(drawing.previewUrl)
      setDrawing(null)
    }
  }

  const handleSubmit = async () => {
    if (!canSubmit) return

    setIsSubmitting(true)
    try {
      const newPost = await createPost({ content: content.replace(/\s+$/, ''), visibility, rating, mediaItems, drawing, replyAid, quoteAid, communityAid })
      addPosts([newPost])
      if (!replyAid) {
        prependFeedItem(communityAid ? `community:${communityAid}:current` : 'current', { type: 'post', post_aid: newPost.aid })
      }
      addToast({ message: '投稿しました' })

      mediaItems.forEach((item) => URL.revokeObjectURL(item.url))
      if (drawing) URL.revokeObjectURL(drawing.previewUrl)
      setContent('')
      setMediaItems([])
      setDrawing(null)
      setRating('general')
      setVisibility('opened')
      onSuccess?.(newPost)
    } catch (error: unknown) {
      console.error(error)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errorMessage = (error as any).response?.data?.errors?.join(', ') || '投稿に失敗しました'
      addToast({ message: 'エラー', detail: errorMessage })
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
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
  }
}
