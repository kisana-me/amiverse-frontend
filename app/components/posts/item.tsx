"use client";

import Link from 'next/link'
import { useEffect, useState } from 'react'
import "./item.css"

import ItemAccount from './item_account'
import ItemReactions from './item_reactions'
import ItemConsole from './item_console'

import { formatRelativeTime } from '@/app/lib/format_time'

export type ItemType = {
  aid: string;
  created_at: string;
  content: string;
  visibility: string;
  viewed_counter: number;
  control_disabled?: boolean;

  quoters_counter: number;
  diffusers_counter: number;
  repliers_counter: number;
  diffused: boolean;

  reactions_counter: number;
  reactions: {
    emoji: {
      aid: string;
      name: string;
    };
    reaction_count: number;
    reacted: boolean;
  }[];

  account: {
    name: string;
    name_id: string;
    icon_url: string;
    ring_color?: string;
    status_rb_color?: string;
  };
  images?: {
    aid: string;
    url: string;
  }[];
  videos?: {
    aid: string;
    url: string;
  }[];
};

export default function Item({ item }: { item: ItemType }) {

  const strVisibility = (v: string) => ({
    public_share: '全体公開',
    do_not_share: '非公開',
    followers_share: 'フォロワー公開',
    scopings_share: '限定公開',
    direct_share: '直接公開',
  }[v] ?? '全体公開');

  return (
    <>
      <div className="item">
        <ItemAccount account={item.account} />
        <div className='item-info item-top-info'>
          <div className='iti-left'>
            <Link href={'/items/' + item.aid} style={{color: 'inherit', textDecoration: 'none'}}>
              返信/引用
            </Link>
          </div>
          <div className='iti-right'>
            <Link href={'/items/' + item.aid} style={{color: 'inherit', textDecoration: 'none'}}>
              { formatRelativeTime(new Date(item.created_at)) }
            </Link>
          </div>
        </div>
        <div className="item-content">
          {item.content}
          {(() => {
            if (item.images && item.images.length > 0) {
              return item.images.map(image => (
                <div key={image.aid}>
                  <img src={image.url} className="item-content-image"></img>
                </div>
              ))
            } else {
              return
            }
          })()}
          {(() => {
            if (item.videos && item.videos.length > 0) {
              return item.videos.map(video => (
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
            <Link href={'/items/' + item.aid} style={{color: 'inherit', textDecoration: 'none'}}>
              {strVisibility(item.visibility)}
            </Link>
          </div>
          <div className='ibi-right'>
            <Link href={'/items/' + item.aid} style={{color: 'inherit', textDecoration: 'none'}}>
              {item.viewed_counter}回表示
            </Link>
          </div>
        </div>
        <ItemReactions item={item} />
        <ItemConsole item={item} />
      </div>
    </>
  )
};
