"use client";

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/axios';
import { useToast } from '@/app/providers/ToastProvider';
import { useFeeds } from '@/app/providers/FeedsProvider';
import { usePosts } from '@/app/providers/PostsProvider';
import { PostType } from '@/types/post';
import Post from './post';
import DrawingEditor from './DrawingEditor';
import "./form.css";

interface PostFormProps {
  replyPost?: PostType;
  quotePost?: PostType;
  onSuccess?: () => void;
}

export default function PostForm({ replyPost, quotePost, onSuccess }: PostFormProps) {
  const router = useRouter();
  const { prependFeedItem } = useFeeds();
  const { addPosts } = usePosts();
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState('opened');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDrawingOpen, setIsDrawingOpen] = useState(false);
  const [drawingData, setDrawingData] = useState<{ blob: Blob, packed: string, previewUrl: string, name: string, description: string } | null>(null);
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
    if (!content && mediaFiles.length === 0 && !drawingData) return;
    
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

    if (drawingData) {
      // Send as array of attributes to match backend expectation
      formData.append('post[drawing_attributes][data]', drawingData.packed);
      formData.append('post[drawing_attributes][name]', drawingData.name || '');
      formData.append('post[drawing_attributes][description]', drawingData.description || '');
    }

    mediaFiles.forEach((file) => {
      formData.append('post[media_files][]', file);
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

      addToast({ title: '成功', message: '投稿しました' });
      setContent('');
      setMediaFiles([]);
      if (onSuccess) onSuccess();
      router.push('/?tab=current');
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

      {drawingData && (
        <div className="post-form-media-preview">
          <div className="media-preview-item" style={{ width: '100%', maxWidth: '320px', height: 'auto', aspectRatio: '320/120' }}>
            <img 
              src={drawingData.previewUrl} 
              alt="drawing preview" 
              style={{ width: '100%', height: '100%', objectFit: 'contain', imageRendering: 'pixelated', backgroundColor: '#fff' }} 
            />
            <button className="media-remove-btn" onClick={handleRemoveDrawing}>×</button>
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
        </div>

        <button
          className="post-form-submit"
          onClick={handleSubmit}
          disabled={isSubmitting || (!content && mediaFiles.length === 0 && !drawingData)}
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
