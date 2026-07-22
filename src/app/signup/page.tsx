'use client'

import { useRouter } from 'next/navigation'
import { useCurrentAccount } from '@/providers/CurrentAccountProvider'
import { useToast } from '@/providers/ToastProvider'
import Link from 'next/link'
import Script from 'next/script'
import { useEffect, useRef, useState } from 'react'
import { api } from '@/lib/axios'
import MainHeader from '@/components/main_header/MainHeader'
import styles from './styles.module.css'

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, options: Record<string, unknown>) => string
      reset: (widgetId?: string) => void
    }
  }
}

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY
const RESEND_INTERVAL = 60

export default function Page() {
  const router = useRouter()
  const { addToast } = useToast()
  const { currentAccountStatus } = useCurrentAccount()

  const [formName, setFormName] = useState('')
  const [formNameId, setFormNameId] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [isAgreed, setIsAgreed] = useState(false)

  const [turnstileToken, setTurnstileToken] = useState('')
  const [code, setCode] = useState('')
  const [isCodeSent, setIsCodeSent] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [isSendingCode, setIsSendingCode] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const turnstileRef = useRef<HTMLDivElement>(null)
  const turnstileWidgetId = useRef<string | null>(null)

  const renderTurnstile = () => {
    if (!window.turnstile || !turnstileRef.current || turnstileWidgetId.current || !TURNSTILE_SITE_KEY) return
    turnstileWidgetId.current = window.turnstile.render(turnstileRef.current, {
      sitekey: TURNSTILE_SITE_KEY,
      callback: (token: string) => setTurnstileToken(token),
      'expired-callback': () => setTurnstileToken(''),
      'error-callback': () => setTurnstileToken(''),
    })
  }

  useEffect(() => {
    renderTurnstile()
  }, [])

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  useEffect(() => {
    if (currentAccountStatus === 'signed_in') {
      addToast({
        message: 'サインイン済み',
        detail: 'あなたはすでにサインイン済みです',
      })
      router.push('/')
    }
  }, [currentAccountStatus, addToast, router])

  if (currentAccountStatus === 'signed_in') {
    return null
  }

  const isNameValid = formName.length >= 1 && formName.length <= 50
  const isNameIdValid = /^[a-zA-Z0-9_]{5,50}$/.test(formNameId)
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formEmail)
  const isCodeValid = /^\d{6}$/.test(code)
  const canSendCode = isEmailValid && isAgreed && turnstileToken.length > 0 && cooldown === 0 && !isSendingCode
  const isFormValid = isNameValid && isNameIdValid && isEmailValid && isAgreed && isCodeSent && isCodeValid

  const resetTurnstile = () => {
    setTurnstileToken('')
    if (turnstileWidgetId.current) window.turnstile?.reset(turnstileWidgetId.current)
  }

  const handleError = (error: unknown, fallback: string) => {
    const data = (error as { response?: { data?: { message?: string; errors?: string[] } } }).response?.data
    const detail = data?.errors?.length ? data.errors.join('\n') : data?.message || fallback
    setErrorMessage(detail)
    addToast({ message: 'エラー', detail: data?.message || fallback })
  }

  const handleEmailChange = (value: string) => {
    setFormEmail(value)
    setIsCodeSent(false)
    setCode('')
  }

  const handleSendCode = () => {
    if (!canSendCode) return

    setIsSendingCode(true)
    setErrorMessage('')
    api
      .post('/signup/code', { email: formEmail, turnstile_token: turnstileToken })
      .then(() => {
        setIsCodeSent(true)
        setCooldown(RESEND_INTERVAL)
        addToast({ message: '確認コードを送信しました', detail: `メールをご確認ください` })
      })
      .catch((error) => handleError(error, '確認コードの送信に失敗しました'))
      .finally(() => {
        setIsSendingCode(false)
        resetTurnstile()
      })
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!isFormValid || isSubmitting) return

    setIsSubmitting(true)
    setErrorMessage('')
    api
      .post('/signup', { account: { name: formName, name_id: formNameId, email: formEmail, is_agreed: isAgreed }, code })
      .then((response) => {
        if (response.data.status === 'success') {
          addToast({ message: 'アカウント作成完了', detail: response.data.message })
          setTimeout(() => {
            window.location.href = '/'
          }, 2000)
        }
      })
      .catch((error) => {
        setIsSubmitting(false)
        handleError(error, 'サインアップに失敗しました')
      })
  }

  const resendLabel = () => {
    if (isSendingCode) return '送信中...'
    if (cooldown > 0) return `再送まで ${cooldown} 秒`
    return '確認コードを再送'
  }

  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" onLoad={renderTurnstile} />
      <MainHeader>サインアップ</MainHeader>
      <div className={styles.background}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1>アカウント作成</h1>
            <p>あなたのプロフィールを入力してください</p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.group}>
              <label className={styles.label} htmlFor="name">
                名前
                <span className={styles.label_required}>必須</span>
              </label>
              <input type="text" name="name" id="name" className={styles.input} placeholder="例: たろう" value={formName} onChange={(e) => setFormName(e.target.value)} maxLength={50} />
              <span className={styles.hint}>1〜50文字で入力してください</span>
            </div>

            <div className={styles.group}>
              <label className={styles.label} htmlFor="name_id">
                ID
                <span className={styles.label_required}>必須</span>
              </label>
              <input type="text" name="name_id" id="name_id" className={styles.input} placeholder="例: taro_123" value={formNameId} onChange={(e) => setFormNameId(e.target.value)} maxLength={50} />
              <span className={styles.hint}>5〜50文字の半角英数字とアンダーバー(_)が使えます</span>
            </div>

            <div className={styles.group}>
              <label className={styles.label} htmlFor="email">
                メールアドレス
                <span className={styles.label_required}>必須</span>
              </label>
              <input type="email" name="email" id="email" className={styles.input} placeholder="例: taro@example.com" value={formEmail} onChange={(e) => handleEmailChange(e.target.value)} />
              <span className={styles.hint}>確認コードを送信します</span>
            </div>

            <div className={styles.agreement}>
              <input type="checkbox" name="is_agreed" id="is_agreed" className={styles.checkbox} checked={isAgreed} onChange={(e) => setIsAgreed(e.target.checked)} />
              <label htmlFor="is_agreed">
                <Link prefetch={false} href="/terms-of-service" target="_blank" rel="noopener noreferrer">
                  利用規約
                </Link>
                と
                <Link prefetch={false} href="/privacy-policy" target="_blank" rel="noopener noreferrer">
                  プライバシーポリシー
                </Link>
                に同意します
              </label>
            </div>

            <div ref={turnstileRef} className={styles.turnstile} />

            {isCodeSent && (
              <div className={styles.group}>
                <label className={styles.label} htmlFor="code">
                  確認コード
                  <span className={styles.label_required}>必須</span>
                </label>
                <input
                  type="text"
                  name="code"
                  id="code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  className={styles.input}
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                />
                <span className={styles.hint}>
                  メールに記載された6桁の数字を入力してください
                  <br />
                  届かない場合は
                  <button type="button" className={styles.text_button} onClick={handleSendCode} disabled={!canSendCode}>
                    {resendLabel()}
                  </button>
                </span>
              </div>
            )}

            {errorMessage && <p className={styles.error_message}>{errorMessage}</p>}

            {isCodeSent ? (
              <button type="submit" className={styles.submit_button} disabled={!isFormValid || isSubmitting}>
                {isSubmitting ? '作成中...' : 'アカウントを作成'}
              </button>
            ) : (
              <button type="button" className={styles.submit_button} onClick={handleSendCode} disabled={!canSendCode}>
                {isSendingCode ? '送信中...' : '確認コードを送信'}
              </button>
            )}
          </form>
        </div>
      </div>
    </>
  )
}
