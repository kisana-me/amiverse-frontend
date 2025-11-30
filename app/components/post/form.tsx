"use client";

import React, { useState, useRef } from 'react';
import { api } from '@/app/lib/axios';
import { useToast } from '@/app/providers/ToastProvider';
import { PostType } from '@/types/post';
import Post from './post';
import "./form.css";

interface PostFormProps {
  replyPost?: PostType;
  quotePost?: PostType;
  onSuccess?: () => void;
}

export default function PostForm({ replyPost, quotePost, onSuccess }: PostFormProps) {
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState('opened');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (mediaFiles.length + files.length > 8) {
        addToast({ title: 'エラー', message: '画像・動画は最大8個までです' });
        return;
      }
      setMediaFiles([...mediaFiles, ...files]);
    }
  };

  const removeFile = (index: number) => {
    setMediaFiles(mediaFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!content && mediaFiles.length === 0) return;
    
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('post[content]', content);
    formData.append('post[visibility]', visibility);
    
    if (replyPost) {
      formData.append('post[reply_aid]', replyPost.aid);
    }
    if (quotePost) {
      formData.append('post[quote_aid]', quotePost.aid);
    }

    mediaFiles.forEach((file) => {
      formData.append('post[media_files][]', file);
    });

    try {
      await api.post('/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      addToast({ title: '成功', message: '投稿しました' });
      setContent('');
      setMediaFiles([]);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.response?.data?.errors?.join(', ') || '投稿に失敗しました';
      addToast({ title: 'エラー', message: errorMessage });
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

      {mediaFiles.length > 0 && (
        <div className="post-form-media-preview">
          {mediaFiles.map((file, index) => (
            <div key={index} className="media-preview-item">
              {file.type.startsWith('video') ? (
                <video src={URL.createObjectURL(file)} />
              ) : (
                <img src={URL.createObjectURL(file)} alt="preview" />
              )}
              <button className="media-remove-btn" onClick={() => removeFile(index)}>×</button>
            </div>
          ))}
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

          <select
            className="visibility-select"
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            disabled={isSubmitting}
          >
            <option value="opened">全体公開</option>
          </select>
        </div>

        <button
          className="post-form-submit"
          onClick={handleSubmit}
          disabled={isSubmitting || (!content && mediaFiles.length === 0)}
        >
          {isSubmitting ? '送信中...' : '投稿する'}
        </button>
      </div>
    </div>
  );
}
