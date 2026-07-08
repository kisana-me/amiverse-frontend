"use client";

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/axios';
import { useToast } from '@/providers/ToastProvider';
import { useFeeds } from '@/providers/FeedsProvider';
import { usePosts } from '@/providers/PostsProvider';
import { PostType } from '@/types/post';
import Post from './post';
import DrawingEditor from './DrawingEditor';
import "./form.css";

interface PostFormProps {
  replyPost?: PostType;
  quotePost?: PostType;
  onSuccess?: () => void;
}

// 画像・動画は投稿本体とは別に、メディアごとにレーティング・名前・説明を持てる
type MediaItem = {
  file: File;
  url: string;
  rating: string;
  name: string;
  description: string;
};

export default function PostForm({ replyPost, quotePost, onSuccess }: PostFormProps) {
  const router = useRouter();
  const { prependFeedItem } = useFeeds();
  const { addPosts } = usePosts();
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState('opened');
  const [rating, setRating] = useState('general');
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDrawingOpen, setIsDrawingOpen] = useState(false);
  const [drawingData, setDrawingData] = useState<{ blob: Blob, packed: string, previewUrl: string, name: string, description: string } | null>(null);
  const [drawingRating, setDrawingRating] = useState('general');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  const handleDrawingSave = (blob: Blob, packed: string, name: string, description: string) => {
    const previewUrl = URL.createObjectURL(blob);
    setDrawingData({ blob, packed, previewUrl, name, description });
    setIsDrawingOpen(false);
  };

  const handleRemoveDrawing = () => {
    if (drawingData) {
      URL.revokeObjectURL(drawingData.previewUrl);
      setDrawingData(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (mediaItems.length + files.length > 8) {
        addToast({ message: 'エラー', detail: '画像・動画は最大8個までです' });
        return;
      }
      const newItems: MediaItem[] = files.map((file) => ({
        file,
        url: URL.createObjectURL(file),
        rating: 'general',
        name: '',
        description: '',
      }));
      setMediaItems([...mediaItems, ...newItems]);
    }
  };

  const updateMediaItem = (index: number, patch: Partial<MediaItem>) => {
    setMediaItems((items) => items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const removeFile = (index: number) => {
    setMediaItems((items) => {
      const target = items[index];
      if (target) URL.revokeObjectURL(target.url);
      return items.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async () => {
    if (!content && mediaItems.length === 0 && !drawingData) return;

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('post[content]', content);
    formData.append('post[visibility]', visibility);
    formData.append('post[user_rating]', rating);

    if (replyPost) {
      formData.append('post[reply_aid]', replyPost.aid);
    }
    if (quotePost) {
      formData.append('post[quote_aid]', quotePost.aid);
    }

    if (drawingData) {
      formData.append('post[drawing_attributes][data]', drawingData.packed);
      formData.append('post[drawing_attributes][name]', drawingData.name || '');
      formData.append('post[drawing_attributes][description]', drawingData.description || '');
      formData.append('post[drawing_attributes][rating]', drawingRating);
    }

    mediaItems.forEach((item, i) => {
      formData.append(`post[media_attributes][${i}][file]`, item.file);
      formData.append(`post[media_attributes][${i}][rating]`, item.rating);
      formData.append(`post[media_attributes][${i}][name]`, item.name);
      formData.append(`post[media_attributes][${i}][description]`, item.description);
    });

    try {
      const res = await api.post('/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const newPost = res.data;
      addPosts([newPost]);
      prependFeedItem('current', { type: 'post', post_aid: newPost.aid });

      addToast({ message: '投稿しました' });
      setContent('');
      mediaItems.forEach((item) => URL.revokeObjectURL(item.url));
      setMediaItems([]);
      setRating('general');
      setDrawingRating('general');
      if (onSuccess) onSuccess();
      router.push('/?tab=current');
    } catch (error: unknown) {
      console.error(error);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errorMessage = (error as any).response?.data?.errors?.join(', ') || '投稿に失敗しました';
      addToast({ message: 'エラー', detail: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="post-form">
      {replyPost && (
        <div className="post-form-target">
          <div style={{ fontSize: '0.8rem', color: 'var(--font-color)', marginBottom: '0.5rem' }}>返信先:</div>
          <div style={{ pointerEvents: 'none', opacity: 0.8, transform: 'scale(0.9)', transformOrigin: 'top left' }}>
            <Post {...replyPost} />
          </div>
        </div>
      )}
      {quotePost && (
        <div className="post-form-target">
          <div style={{ fontSize: '0.8rem', color: 'var(--font-color)', marginBottom: '0.5rem' }}>引用元:</div>
          <div style={{ pointerEvents: 'none', opacity: 0.8, transform: 'scale(0.9)', transformOrigin: 'top left' }}>
            <Post {...quotePost} />
          </div>
        </div>
      )}

      <textarea
        className="post-form-textarea"
        placeholder="いまどうしてる？"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={isSubmitting}
      />

      {mediaItems.length > 0 && (
        <div className="post-form-media-list">
          {mediaItems.map((item, index) => (
            <div key={index} className="media-edit-item">
              <div className="media-edit-preview">
                {item.file.type.startsWith('video') ? <video src={item.url} /> : <img src={item.url} alt="preview" />}
                <button className="media-remove-btn" onClick={() => removeFile(index)}>×</button>
              </div>
              <div className="media-edit-fields">
                <input
                  type="text"
                  className="media-edit-input"
                  placeholder="名前(任意)"
                  maxLength={50}
                  value={item.name}
                  onChange={(e) => updateMediaItem(index, { name: e.target.value })}
                  disabled={isSubmitting}
                />
                <input
                  type="text"
                  className="media-edit-input"
                  placeholder="説明(任意)"
                  maxLength={500}
                  value={item.description}
                  onChange={(e) => updateMediaItem(index, { description: e.target.value })}
                  disabled={isSubmitting}
                />
                <select
                  className="media-edit-input"
                  value={item.rating}
                  onChange={(e) => updateMediaItem(index, { rating: e.target.value })}
                  disabled={isSubmitting}
                  title="このメディアのレーティング"
                >
                  <option value="general">全年齢</option>
                  <option value="nsfw">センシティブ</option>
                  <option value="r18">R-18</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {drawingData && (
        <div className="post-form-media-list">
          <div className="media-edit-item">
            <div className="media-edit-preview" style={{ maxWidth: '320px', aspectRatio: '320/120' }}>
              <img
                src={drawingData.previewUrl}
                alt="drawing preview"
                style={{ width: '100%', height: '100%', objectFit: 'contain', imageRendering: 'pixelated', backgroundColor: '#fff' }}
              />
              <button className="media-remove-btn" onClick={handleRemoveDrawing}>×</button>
            </div>
            <div className="media-edit-fields">
              <select
                className="media-edit-input"
                value={drawingRating}
                onChange={(e) => setDrawingRating(e.target.value)}
                disabled={isSubmitting}
                title="このお絵描きのレーティング"
              >
                <option value="general">全年齢</option>
                <option value="nsfw">センシティブ</option>
                <option value="r18">R-18</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="post-form-controls">
        <div className="post-form-options">
          <label className="file-input-label" title="画像/動画を追加">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              accept="image/*,video/*"
              style={{ display: 'none' }}
              disabled={isSubmitting}
            />
          </label>

          <button 
            className="file-input-label" 
            onClick={() => setIsDrawingOpen(true)} 
            title="お絵描き"
            disabled={isSubmitting}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19l7-7 3 3-7 7-3-3z" />
              <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
            </svg>
          </button>

          <select
            className="visibility-select"
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            disabled={isSubmitting}
          >
            <option value="opened">全体公開</option>
          </select>

          <select
            className="visibility-select"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            disabled={isSubmitting}
            title="レーティング"
          >
            <option value="general">全年齢</option>
            <option value="nsfw">センシティブ</option>
            <option value="r18">R-18</option>
          </select>
        </div>

        <button
          className="post-form-submit"
          onClick={handleSubmit}
          disabled={isSubmitting || (!content && mediaItems.length === 0 && !drawingData)}
        >
          {isSubmitting ? '送信中...' : '投稿する'}
        </button>
      </div>
      
      {isDrawingOpen && (
        <DrawingEditor 
          onClose={() => setIsDrawingOpen(false)} 
          onSave={handleDrawingSave} 
          initialData={drawingData?.packed}
          initialName={drawingData?.name}
          initialDescription={drawingData?.description}
        />
      )}
    </div>
  );
}
