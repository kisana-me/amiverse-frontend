"use client";

import "./style.css"
import { useToast } from '@/app/providers/ToastProvider'

export default function MainHeader() {
  const { showToasts } = useToast()

  return (
    <>
      {showToasts.map((toast, index) => (
        <div key={index} className="toast" style={{ bottom: `${70+40*index}px`}} >
          {toast.message}
        </div>
      ))}
    </>
  )
}
