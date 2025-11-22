"use client";

import React, { useState, useRef, useEffect } from 'react';

export const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children,
  width = 'max-w-md' // 幅を調整できるように少し拡張
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  title?: string; 
  children: React.ReactNode;
  width?: string;
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen) {
      if (!dialog.open) dialog.showModal();
    } else {
      if (dialog.open) dialog.close();
    }
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const rect = dialog.getBoundingClientRect();
    const isInDialog =
      rect.top <= e.clientY &&
      e.clientY <= rect.top + rect.height &&
      rect.left <= e.clientX &&
      e.clientX <= rect.left + rect.width;
    if (!isInDialog) onClose();
  };

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      onClose={onClose}
      className={`
        backdrop:bg-black/50 backdrop:backdrop-blur-[2px]
        fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 
        w-full ${width} rounded-xl bg-white shadow-2xl 
        p-0 m-0 text-slate-800
        animate-in fade-in zoom-in-95 duration-200
        open:flex open:flex-col
      `}
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 rounded-t-xl">
        <h3 className="font-bold text-lg text-slate-900">{title}</h3>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 transition-colors text-slate-400 hover:text-slate-600">
          ×
        </button>
      </div>
      <div className="px-6 py-6 overflow-y-auto max-h-[70vh]">
        {children}
      </div>
    </dialog>
  );
};
