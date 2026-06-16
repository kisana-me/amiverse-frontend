import { api } from '@/lib/axios'

export const addReaction = async (postAid: string, emojiNameId: string) => {
  return await api.post(`/posts/${postAid}/reaction`, { emoji_name_id: emojiNameId })
}

export const removeReaction = async (postAid: string) => {
  return await api.delete(`/posts/${postAid}/reaction`)
}
