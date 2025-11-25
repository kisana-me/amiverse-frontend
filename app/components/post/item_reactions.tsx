"use client";

import { useState, useRef, useEffect } from 'react'
import "./item_reactions.css"
import { PostType } from '@/types/post';
import { EmojiType } from '@/types/emoji';
import { Modal } from '../modal/Modal';
import EmojiPicker from '../emoji_picker/EmojiPicker';
import { api } from '@/app/lib/axios';
import { usePosts } from '@/app/providers/PostsProvider';

export default function ItemReactions(initialPost: PostType) {
  const emojiButtonRef = useRef(null)
  const [isEmojiMenuOpen, setIsEmojiMenuOpen] = useState(false)
  const [post, setPost] = useState(initialPost);
  const { addPosts } = usePosts();

  useEffect(() => {
    setPost(initialPost);
  }, [initialPost]);

  const itemReact = async (emojiInput: EmojiType | string) => {
    setIsEmojiMenuOpen(false);

    const emojiAid = typeof emojiInput === 'string' ? emojiInput : emojiInput.aid;
    const emojiName = typeof emojiInput === 'object' ? emojiInput.name : null;

    const currentReaction = post.reactions?.find(r => r.reacted);
    const isRemoving = currentReaction?.aid === emojiAid;

    const prevPost = { ...post };
    const newPost = { ...post };
    newPost.reactions = newPost.reactions ? [...newPost.reactions] : [];

    if (currentReaction) {
      const idx = newPost.reactions.findIndex(r => r.aid === currentReaction.aid);
      if (idx !== -1) {
        newPost.reactions[idx] = {
          ...newPost.reactions[idx],
          reactions_count: Math.max(0, (newPost.reactions[idx].reactions_count || 0) - 1),
          reacted: false
        };
        if (newPost.reactions[idx].reactions_count === 0) {
          newPost.reactions.splice(idx, 1);
        }
      }
      newPost.reactions_count = Math.max(0, (newPost.reactions_count || 0) - 1);
      newPost.is_reacted = false;
    }

    if (!isRemoving) {
      const idx = newPost.reactions.findIndex(r => r.aid === emojiAid);
      if (idx !== -1) {
        newPost.reactions[idx] = {
          ...newPost.reactions[idx],
          reactions_count: (newPost.reactions[idx].reactions_count || 0) + 1,
          reacted: true
        };
      } else if (emojiName) {
        newPost.reactions.push({
          aid: emojiAid,
          name: emojiName,
          name_id: typeof emojiInput === 'object' ? emojiInput.name_id : '',
          reactions_count: 1,
          reacted: true
        });
      }
      newPost.reactions_count = (newPost.reactions_count || 0) + 1;
      newPost.is_reacted = true;
    }

    setPost(newPost);
    addPosts([newPost]);

    try {
      if (isRemoving) {
        await api.delete(`/posts/${post.aid}/reaction`);
      } else {
        await api.post(`/posts/${post.aid}/reaction`, { emoji_aid: emojiAid });
      }
    } catch (error) {
      console.error("Reaction failed", error);
      setPost(prevPost);
      addPosts([prevPost]);
    }
  }

  return (
    <>
      <div className="reactions">
        <div className="reactions-content">
          <button
            ref={emojiButtonRef}
            className={'reaction-button rb-emojis' + (post.is_reacted ? ' rb-reacted' : '')}
            onClick={() => setIsEmojiMenuOpen(true)}
          >
            <div className="reaction-icon">
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M76 11H70V24H57V30H70V43H76V30H89V24H76V11ZM50 27C50 21.5581 51.8899 16.5576 55.0492 12.6192C52.7609 12.2123 50.4052 12 48 12C25.9086 12 8 29.9086 8 52C8 74.0914 25.9086 92 48 92C70.0914 92 88 74.0914 88 52C88 49.5948 87.7877 47.2391 87.3808 44.9508C83.4424 48.1101 78.4419 50 73 50C60.2975 50 50 39.7025 50 27ZM36 34C32.6863 34 30 36.6863 30 40C30 43.3137 32.6863 46 36 46C39.3137 46 42 43.3137 42 40C42 36.6863 39.3137 34 36 34ZM32.8247 59C32.3692 59 32 59.3693 32 59.8247C32 68.2058 38.7942 75 47.1753 75H51.8247C60.2058 75 67 68.2058 67 59.8247C67 59.3693 66.6308 59 66.1753 59H32.8247Z" fill="currentColor"/>
              </svg>
            </div>
            <div className="reaction-number">{post.reactions_count}</div>
          </button>

          <Modal
            isOpen={isEmojiMenuOpen}
            onClose={() => setIsEmojiMenuOpen(false)}
            title="リアクションを選択"
            width="max-w-sm"
          >
            <EmojiPicker onEmojiSelect={itemReact} />
          </Modal>
        </div>

        <div className="reactions-content">
          {post?.reactions && post.reactions.map(emoji => (
            <button className={"reaction-button rb-emoji" + (emoji.reacted ? " rb-reacted" : "")}
              key={emoji.aid}
              onClick={() => itemReact(emoji.aid)}
            >
              <div className="reaction-emoji">
                {emoji.name}
              </div>
              <div className="reaction-number">
                {emoji.reactions_count}
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
