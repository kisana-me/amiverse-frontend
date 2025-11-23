"use client";

import { useState } from 'react'
import Link from 'next/link'
import "./post.css"

import ItemAccount from './item_account'
import ItemReactions from './item_reactions'
import ItemConsole from './item_console'
import MediaViewer from '../media_viewer/MediaViewer'

import { formatRelativeTime } from '@/app/lib/format_time'

import { PostType } from "@/types/post";

export default function Post(post: PostType) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const openViewer = (index: number) => {
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

  return (
    <>
      <div className="item">
        <ItemAccount {...post} />
        <div className='item-info item-top-info'>
          <div className='iti-left'>
            <Link href={'/posts/' + post.aid} style={{color: 'inherit', textDecoration: 'none'}}>
              返信/引用
            </Link>
          </div>
          <div className='iti-right'>
            <Link href={'/posts/' + post.aid} style={{color: 'inherit', textDecoration: 'none'}}>
              { formatRelativeTime(new Date(post.created_at)) }
            </Link>
          </div>
        </div>
        <div className="item-content">
          {post.content}
          {post.media && post.media.length > 0 && (
            <div className={`item-content-images images-${Math.min(post.media.length, 4)}`}>
              {post.media.map((media, index) => (
                <div key={media.aid} className="item-content-image-wrapper" onClick={() => openViewer(index)}>
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
        
        {post.media && (
          <MediaViewer
            mediaList={post.media}
            initialIndex={viewerIndex}
            isOpen={isViewerOpen}
            onClose={() => setIsViewerOpen(false)}
          />
        )}
      </div>
    </>
  )
};
