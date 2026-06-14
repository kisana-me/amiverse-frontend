'use client'

import MainHeader from '@/components/main_header/MainHeader'
import { useToast } from '@/providers/ToastProvider'
import Link from 'next/link'
import styles from './styles.module.css'

export default function Page() {
  const { addToast } = useToast()

  return (
    <>
      <MainHeader>Dev Page</MainHeader>
      <h2>トースト通知</h2>
      <button className={styles.button} onClick={() => addToast({ message: 'これはトースト通知です' })}>
        message
      </button>
      <br />
      <button className={styles.button} onClick={() => addToast({ message: 'これはトースト通知です', detail: '詳細情報です' })}>
        message + detail
      </button>
      <br />
      <Link href="/dev/post" className={styles.link}>
        post
      </Link>
      <br />
      <Link href="/dev/posts" className={styles.link}>
        posts
      </Link>
    </>
  )
}
