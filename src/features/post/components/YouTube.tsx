'use client'

import './YouTube.css'
import { PostType } from '@/types/post'

export default function Content(post: PostType) {
  const extractFirstYouTubeVideoId = (text: string): string | null => {
    if (!text) return null

    const urlRegex = /(https?:\/\/[^\s]+)/g
    let match: RegExpExecArray | null
    while ((match = urlRegex.exec(text)) !== null) {
      const rawUrl = match[1]
      const sanitizedUrl = rawUrl.replace(/[\]\)\}\"'.,!?;:]+$/g, '')
      let parsed: URL
      try {
        parsed = new URL(sanitizedUrl)
      } catch {
        continue
      }

      const host = parsed.hostname.toLowerCase()
      const isYouTube = host === 'youtu.be' || host.endsWith('.youtu.be') || host === 'youtube.com' || host.endsWith('.youtube.com')
      if (!isYouTube) continue

      let videoId: string | null = null
      if (host === 'youtu.be' || host.endsWith('.youtu.be')) {
        videoId = decodeURIComponent(parsed.pathname.replace(/^\//, '')).split('/')[0] || null
      } else {
        const path = parsed.pathname
        if (path === '/watch') {
          videoId = parsed.searchParams.get('v')
        } else if (path.startsWith('/shorts/')) {
          videoId = path.split('/')[2] || null
        } else if (path.startsWith('/live/')) {
          videoId = path.split('/')[2] || null
        } else if (path.startsWith('/embed/')) {
          videoId = path.split('/')[2] || null
        }
      }

      if (!videoId) continue
      if (!/^[a-zA-Z0-9_-]{6,20}$/.test(videoId)) continue
      return videoId
    }
    return null
  }
  const hasMedia = !!(post.media && post.media.length > 0)
  const youtubeVideoId = !hasMedia ? extractFirstYouTubeVideoId(post.content) : null

  return (
    <>
      {!hasMedia && youtubeVideoId && (
        <div className="post-youtube" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${youtubeVideoId}`}
            title="YouTube"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      )}
    </>
  )
}
