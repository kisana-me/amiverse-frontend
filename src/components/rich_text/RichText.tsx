'use client'

import { useState } from 'react'
import Link from 'next/link'
import styles from './style.module.css'

type Props = {
  content: string
  className?: string
}

// URLを表示用に短縮する（プロトコル除去・長いパスは省略）
const formatUrlForDisplay = (url: string): string => {
  let displayUrl = url.replace(/^https?:\/\//, '')
  if (displayUrl.endsWith('/') && displayUrl.length > 1) {
    displayUrl = displayUrl.slice(0, -1)
  }

  const slashIndex = displayUrl.indexOf('/')
  if (slashIndex === -1) {
    return displayUrl
  }

  const path = displayUrl.substring(slashIndex)
  return path.length > 14 ? `${displayUrl.substring(0, slashIndex)}${path.substring(0, 14)}...` : displayUrl
}

/**
 * 平文を修飾して表示する共通コンポーネント。
 *
 * - URL / メンション / ハッシュタグをリンク化する
 * - 長文（600文字 or 16行超）は「もっと見る」で折りたたむ
 *
 * 投稿本文・アカウントの説明欄など、平文をリッチに表示したい箇所で使う。
 * フォントサイズ等の微調整は className で上書きする。
 */
export default function RichText({ content, className }: Props) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!content) return null

  const lines = content.split(/\r?\n/)
  const isLongContent = content.length > 600
  const isManyLines = lines.length > 16
  const shouldTruncate = isLongContent || isManyLines

  let displayLines = lines
  if (shouldTruncate && !isExpanded) {
    let textToShow = content
    if (isManyLines) {
      textToShow = lines.slice(0, 16).join('\n')
    }
    if (textToShow.length > 600) {
      textToShow = textToShow.substring(0, 600) + '...'
    }
    displayLines = textToShow.split(/\r?\n/)
  }

  const parseLine = (line: string, lineIndex: number) => {
    if (line === '') {
      return <br />
    }

    const regex = /(https?:\/\/[^\s]+)|((?:^|\s)(?:@)?[a-zA-Z0-9_]+@[a-zA-Z0-9.-]+)|((?:^|\s)@[a-zA-Z0-9_]{1,100})|((?:^|\s)#[^\s]{1,250})/g
    const parts = []
    let lastIndex = 0
    let match

    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push(line.substring(lastIndex, match.index))
      }

      const urlMatch = match[1]
      const remoteMentionMatch = match[2]
      const simpleMentionMatch = match[3]
      const hashtagMatch = match[4]

      if (urlMatch) {
        parts.push(
          <a key={`${lineIndex}-${match.index}`} href={urlMatch} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
            {formatUrlForDisplay(urlMatch)}
          </a>,
        )
      } else if (remoteMentionMatch || simpleMentionMatch) {
        const text = remoteMentionMatch || simpleMentionMatch
        const trimmed = text.trim()
        const leadingSpace = text.substring(0, text.indexOf(trimmed))

        if (leadingSpace) {
          parts.push(leadingSpace)
        }

        let href = trimmed
        if (!href.startsWith('@')) {
          href = '@' + href
        }
        href = '/' + href

        parts.push(
          <Link prefetch={false} key={`${lineIndex}-${match.index}`} href={href} onClick={(e) => e.stopPropagation()}>
            {trimmed}
          </Link>,
        )
      } else if (hashtagMatch) {
        const trimmed = hashtagMatch.trim()
        const leadingSpace = hashtagMatch.substring(0, hashtagMatch.indexOf('#'))

        if (leadingSpace) {
          parts.push(leadingSpace)
        }

        const tagText = trimmed
        const query = encodeURIComponent(tagText)

        parts.push(
          <Link prefetch={false} key={`${lineIndex}-${match.index}`} href={`/search?query=${query}`} onClick={(e) => e.stopPropagation()}>
            {tagText}
          </Link>,
        )
      }

      lastIndex = regex.lastIndex
    }

    if (lastIndex < line.length) {
      parts.push(line.substring(lastIndex))
    }

    return parts.length > 0 ? parts : [line]
  }

  return (
    <div className={`${styles.rich_text}${className ? ` ${className}` : ''}`}>
      {displayLines.map((line, index) => (
        <div key={index}>{parseLine(line, index)}</div>
      ))}
      {shouldTruncate && !isExpanded && (
        <div
          className={styles.rich_text_more}
          onClick={(e) => {
            e.stopPropagation()
            e.preventDefault()
            setIsExpanded(true)
          }}
        >
          もっと見る
        </div>
      )}
    </div>
  )
}
