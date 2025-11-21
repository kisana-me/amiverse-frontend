"use client";

import Link from 'next/link'
import "./post.css"

import ItemAccount from './item_account'
import ItemReactions from './item_reactions'
import ItemConsole from './item_console'

import { formatRelativeTime } from '@/app/lib/format_time'

import { PostType } from "@/types/post";

export default function Post(post: PostType) {

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
          {(() => {
            if (post.images && post.images.length > 0) {
              return post.images.map(image => (
                <div key={image.aid}>
                  <img src={image.url} className="item-content-image"></img>
                </div>
              ))
            } else {
              return
            }
          })()}
          {(() => {
            if (post.videos && post.videos.length > 0) {
              return post.videos.map(video => (
                <div key={video.aid}>
                  <video src={video.url} className="item-content-video" controls={true}></video>
                </div>
              ))
            } else {
              return
            }
          })()}
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
      </div>
    </>
  )
};
