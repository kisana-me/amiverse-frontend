import { api } from '@/lib/axios'

export const deletePost = async (postAid: string) => {
  return await api.delete(`/posts/${postAid}`)
}

export const addDiffuse = async (postAid: string) => {
  return await api.post(`/posts/${postAid}/diffuse`)
}

export const removeDiffuse = async (postAid: string) => {
  return await api.delete(`/posts/${postAid}/diffuse`)
}

export const reportPost = async (targetAid: string, category: string, description: string) => {
  return await api.post('/reports', {
    report: {
      target_type: 'post',
      target_aid: targetAid,
      category,
      description,
    },
  })
}
