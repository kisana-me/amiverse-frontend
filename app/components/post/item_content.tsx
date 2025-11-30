"use client";

import { useState } from 'react';
import Link from 'next/link';
import './item_content.css';

interface ItemContentProps {
  content: string;
}

export default function ItemContent({ content }: ItemContentProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!content) return null;

  const lines = content.split('\n');
  const isLongContent = content.length > 600;
  const isManyLines = lines.length > 16;
  const shouldTruncate = isLongContent || isManyLines;

  let displayLines = lines;
  if (shouldTruncate && !isExpanded) {
    let textToShow = content;
    if (isManyLines) {
      textToShow = lines.slice(0, 16).join('\n');
    }
    if (textToShow.length > 600) {
      textToShow = textToShow.substring(0, 600) + '...';
    }
    displayLines = textToShow.split('\n');
  }

  const parseLine = (line: string, lineIndex: number) => {
    const regex = /(https?:\/\/[^\s]+)|((?:^|\s)(?:@)?[a-zA-Z0-9_]+@[a-zA-Z0-9.-]+)|((?:^|\s)@[a-zA-Z0-9_]{1,100})|((?:^|\s)#[^\s]{1,250})/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push(line.substring(lastIndex, match.index));
      }

      const urlMatch = match[1];
      const remoteMentionMatch = match[2];
      const simpleMentionMatch = match[3];
      const hashtagMatch = match[4];

      if (urlMatch) {
        parts.push(
          <a
            key={`${lineIndex}-${match.index}`}
            href={urlMatch}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            {urlMatch}
          </a>
        );
      } else if (remoteMentionMatch || simpleMentionMatch) {
        const text = remoteMentionMatch || simpleMentionMatch;
        const trimmed = text.trim();
        const leadingSpace = text.substring(0, text.indexOf(trimmed));

        if (leadingSpace) {
          parts.push(leadingSpace);
        }

        let href = trimmed;
        if (!href.startsWith('@')) {
          href = '@' + href;
        }
        href = '/' + href;

        parts.push(
          <Link
            key={`${lineIndex}-${match.index}`}
            href={href}
            onClick={(e) => e.stopPropagation()}
          >
            {trimmed}
          </Link>
        );
      } else if (hashtagMatch) {
        const trimmed = hashtagMatch.trim();
        const leadingSpace = hashtagMatch.substring(0, hashtagMatch.indexOf('#'));

        if (leadingSpace) {
          parts.push(leadingSpace);
        }

        const tagText = trimmed;
        const query = encodeURIComponent(tagText);

        parts.push(
          <Link
            key={`${lineIndex}-${match.index}`}
            href={`/search?query=${query}`}
            onClick={(e) => e.stopPropagation()}
          >
            {tagText}
          </Link>
        );
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < line.length) {
      parts.push(line.substring(lastIndex));
    }

    return parts.length > 0 ? parts : [line];
  };

  return (
    <div className="item-content-text">
      {displayLines.map((line, index) => (
        <div key={index}>
          {parseLine(line, index)}
        </div>
      ))}
      {shouldTruncate && !isExpanded && (
        <div 
          className="item-content-more"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setIsExpanded(true);
          }}
        >
          もっと見る
        </div>
      )}
    </div>
  );
}
