"use client";

import { useState } from 'react'
import Link from 'next/link'
import "./post.css"

import Account from '@/components/Account/OneLine'
import ItemQuote from './item_quote'
import ItemReactions from './item_reactions'
import ItemConsole from './item_console'
import ItemContent from './item_content'
import MediaViewer from '../media_viewer/MediaViewer'

import { formatRelativeTime } from '@/lib/format_time'

import { PostType } from "@/types/post";

type ViewerMedia = {
  url: string;
  aid?: string;
  name?: string;
  type: 'image' | 'video' | 'drawing';
};

type PostProps = PostType & {
  has_thread_line?: boolean;
};

export default function Post(post: PostProps) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [viewerMediaList, setViewerMediaList] = useState<ViewerMedia[]>([]);

  const extractFirstYouTubeVideoId = (text: string): string | null => {
    if (!text) return null;

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    let match: RegExpExecArray | null;
    while ((match = urlRegex.exec(text)) !== null) {
      const rawUrl = match[1];
      const sanitizedUrl = rawUrl.replace(/[\]\)\}\"'.,!?;:]+$/g, '');
      let parsed: URL;
      try {
        parsed = new URL(sanitizedUrl);
      } catch {
        continue;
      }

      const host = parsed.hostname.toLowerCase();
      const isYouTube =
        host === 'youtu.be' ||
        host.endsWith('.youtu.be') ||
        host === 'youtube.com' ||
        host.endsWith('.youtube.com');
      if (!isYouTube) continue;

      let videoId: string | null = null;
      if (host === 'youtu.be' || host.endsWith('.youtu.be')) {
        videoId = decodeURIComponent(parsed.pathname.replace(/^\//, '')).split('/')[0] || null;
      } else {
        const path = parsed.pathname;
        if (path === '/watch') {
          videoId = parsed.searchParams.get('v');
        } else if (path.startsWith('/shorts/')) {
          videoId = path.split('/')[2] || null;
        } else if (path.startsWith('/live/')) {
          videoId = path.split('/')[2] || null;
        } else if (path.startsWith('/embed/')) {
          videoId = path.split('/')[2] || null;
        }
      }

      if (!videoId) continue;
      if (!/^[a-zA-Z0-9_-]{6,20}$/.test(videoId)) continue;
      return videoId;
    }
    return null;
  };

  const openViewer = (index: number, list: ViewerMedia[]) => {
    setViewerMediaList(list);
    setViewerIndex(index);
    setIsViewerOpen(true);
  };

  const strVisibility = (v: string) => ({
    opened: '全体公開',
    closed: '非公開',
    limited: '限定公開',
    followers_only: 'フォロワー公開',
    direct_only: '直接公開',
  }[v] ?? '公開状態不明');

  const hasMedia = !!(post.media && post.media.length > 0);
  const youtubeVideoId = !hasMedia ? extractFirstYouTubeVideoId(post.content) : null;

  return (
    <>
      <div className="item">
        {post.reply_presence && <div className="reply-connector" />}
        {post.has_thread_line && <div className="thread-connector" />}
        <Account account={post.account} />
        <div className='item-info item-top-info'>
          <div className='iti-left'>
            <Link href={'/posts/' + post.aid} style={{color: 'inherit', textDecoration: 'none'}}>
              {post.reply_presence && '返信'}
              {post.quote_presence && (post.reply_presence ? '・引用' : '引用')}
            </Link>
          </div>
          <div className='iti-right'>
            <Link href={'/posts/' + post.aid} style={{color: 'inherit', textDecoration: 'none'}}>
              { formatRelativeTime(new Date(post.created_at)) }
            </Link>
          </div>
        </div>
        <div className="item-content">
          <ItemContent content={post.content} />
          {post.media && post.media.length > 0 && (
            <div className={`item-content-images images-${Math.min(post.media.length, 9)}`}>
              {post.media.map((media, index) => (
                <div key={media.aid} className="item-content-image-wrapper" onClick={() => openViewer(index, post.media!)}>
                  {media.type === 'image' ? (
                    <img
                      src={media.url}
                      className="item-content-image"
                      alt={media.name || "media"}
                    />
                  ) : (
                    <video 
                      src={media.url}
                      className="item-content-image"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
          {post.drawings && post.drawings.length > 0 && (
            <div className="item-content-drawings" style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '4px' }}>
              {post.drawings.map((drawing, index) => (
                <div
                  key={drawing.aid}
                  className="item-content-drawing-wrapper"
                  style={{ width: '100%', cursor: 'pointer' }}
                  onClick={() => openViewer(index, post.drawings!.map(d => ({
                    url: d.image_url,
                    aid: d.aid,
                    name: d.name,
                    type: 'drawing'
                  })))}
                >
                  <img
                    src={drawing.image_url}
                    className="item-content-drawing"
                    alt="drawing"
                    style={{
                      width: '100%',
                      height: 'auto',
                      imageRendering: 'pixelated',
                      border: '1px solid',
                      borderImageSource: 'linear-gradient(45deg, hsl(0, 75%, 70%), hsl(60, 75%, 70%), hsl(120, 75%, 70%), hsl(180, 75%, 70%), hsl(240, 75%, 70%), hsl(300, 75%, 70%), hsl(360, 75%, 70%))',
                      borderImageSlice: 1
                    }}
                  />
                </div>
              ))}
            </div>
          )}
          {!hasMedia && youtubeVideoId && (
            <div
              className="item-content-youtube"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
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
          {post.quote && <ItemQuote quote={post.quote} />}
        </div>
        <div className='item-info item-bottom-info'>
          <div className='ibi-left'>
            <Link href={'/posts/' + post.aid} style={{color: 'inherit', textDecoration: 'none'}}>
              {strVisibility(post.visibility)}
            </Link>
          </div>
          <div className='ibi-right'>
            <Link href={'/posts/' + post.aid} style={{color: 'inherit', textDecoration: 'none'}}>
              {post.views_count}回表示
            </Link>
          </div>
        </div>
        <ItemReactions {...post} />
        <ItemConsole {...post} />
        
        {isViewerOpen && (
          <MediaViewer
            mediaList={viewerMediaList}
            initialIndex={viewerIndex}
            isOpen={isViewerOpen}
            onClose={() => setIsViewerOpen(false)}
          />
        )}
      </div>
    </>
  )
};
