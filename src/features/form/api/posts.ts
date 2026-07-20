import { api } from '@/lib/axios'
import { PostType } from '@/types/post'

export type FormRating = 'general' | 'nsfw' | 'r18'
export type FormVisibility = 'opened' | 'limited'

export type MediaItem = {
  file: File
  url: string
  rating: FormRating
  name: string
  description: string
}

export type DrawingData = {
  blob: Blob
  packed: string
  previewUrl: string
  name: string
  description: string
  rating: FormRating
}

type CreatePostParams = {
  content: string
  visibility: FormVisibility
  rating: FormRating
  mediaItems: MediaItem[]
  drawing: DrawingData | null
  replyAid?: string
  quoteAid?: string
  communityAid?: string
}

export const createPost = async ({ content, visibility, rating, mediaItems, drawing, replyAid, quoteAid, communityAid }: CreatePostParams): Promise<PostType> => {
  const formData = new FormData()
  formData.append('post[content]', content)
  formData.append('post[visibility]', visibility)
  formData.append('post[user_rating]', rating)

  if (replyAid) formData.append('post[reply_aid]', replyAid)
  if (quoteAid) formData.append('post[quote_aid]', quoteAid)
  if (communityAid) formData.append('post[community_aid]', communityAid)

  if (drawing) {
    formData.append('post[drawing_attributes][data]', drawing.packed)
    formData.append('post[drawing_attributes][name]', drawing.name || '')
    formData.append('post[drawing_attributes][description]', drawing.description || '')
    formData.append('post[drawing_attributes][rating]', drawing.rating)
  }

  mediaItems.forEach((item, i) => {
    formData.append(`post[media_attributes][${i}][file]`, item.file)
    formData.append(`post[media_attributes][${i}][rating]`, item.rating)
    formData.append(`post[media_attributes][${i}][name]`, item.name)
    formData.append(`post[media_attributes][${i}][description]`, item.description)
  })

  const res = await api.post('/posts', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
  return res.data
}
