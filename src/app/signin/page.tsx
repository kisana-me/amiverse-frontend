'use client'

import { useRouter } from 'next/navigation'
import { useCurrentAccount } from '@/providers/CurrentAccountProvider'
import { useToast } from '@/providers/ToastProvider'
import Link from 'next/link'
import Image from 'next/image'
import Script from 'next/script'
import { useEffect, useRef, useState } from 'react'
import { api } from '@/lib/axios'
import MainHeader from '@/components/main_header/MainHeader'
import styles from './styles.module.css'
import signup_styles from '../signup/styles.module.css'

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

  const [formEmail, setFormEmail] = useState('')
  const [turnstileToken, setTurnstileToken] = useState('')
  const [code, setCode] = useState('')
  const [isCodeSent, setIsCodeSent] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [isSendingCode, setIsSendingCode] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isOauthLoading, setIsOauthLoading] = useState(false)
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

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formEmail)
  const isCodeValid = /^\d{6}$/.test(code)
  const canSendCode = isEmailValid && turnstileToken.length > 0 && cooldown === 0 && !isSendingCode
  const isFormValid = isEmailValid && isCodeSent && isCodeValid

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
      .post('/signin/code', { email: formEmail, turnstile_token: turnstileToken })
      .then(() => {
        setIsCodeSent(true)
        setCooldown(RESEND_INTERVAL)
        addToast({ message: '認証コードを送信しました', detail: `メールをご確認ください` })
      })
      .catch((error) => handleError(error, '認証コードの送信に失敗しました'))
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
      .post('/signin', { email: formEmail, code })
      .then((response) => {
        if (response.data.status === 'success') {
          addToast({ message: 'サインイン完了', detail: '再読み込みします' })
          setTimeout(() => {
            window.location.href = '/'
          }, 2000)
        }
      })
      .catch((error) => {
        setIsSubmitting(false)
        handleError(error, 'サインインに失敗しました')
      })
  }

  const handleOauth = () => {
    setIsOauthLoading(true)
    api
      .post('/oauth/start')
      .then((response) => {
        const { url } = response.data
        window.location.href = url
      })
      .catch((error) => {
        setIsOauthLoading(false)
        handleError(error, 'サインインに失敗しました')
      })
  }

  const resendLabel = () => {
    if (isSendingCode) return '送信中...'
    if (cooldown > 0) return `再送まで ${cooldown} 秒`
    return '認証コードを再送'
  }

  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" onLoad={renderTurnstile} />
      <MainHeader>サインイン</MainHeader>
      <div className={styles.background}>
        <div className={signup_styles.container}>
          <div className={signup_styles.logo}>
            <Image src="/static-assets/images/amiverse-logo-alpha-400.png" alt="Amiverseのロゴ" width={80} height={80} />
          </div>
          <div className={signup_styles.header}>
            <h1>おかえりなさい</h1>
            <p>Amiverseアカウントはお持ちですよね？</p>
          </div>

          <form className={signup_styles.form} onSubmit={handleSubmit}>
            <div className={signup_styles.group}>
              <label className={signup_styles.label} htmlFor="email">
                メールアドレス
                <span className={signup_styles.label_required}>必須</span>
              </label>
              <input type="email" name="email" id="email" className={signup_styles.input} placeholder="例: taro@example.com" value={formEmail} onChange={(e) => handleEmailChange(e.target.value)} />
              <span className={signup_styles.hint}>認証コードを送信します</span>
            </div>

            <div ref={turnstileRef} className={signup_styles.turnstile} />

            {isCodeSent && (
              <div className={signup_styles.group}>
                <label className={signup_styles.label} htmlFor="code">
                  認証コード
                  <span className={signup_styles.label_required}>必須</span>
                </label>
                <input
                  type="text"
                  name="code"
                  id="code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  className={signup_styles.input}
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                />
                <span className={signup_styles.hint}>
                  メールに記載された6桁の数字を入力してください
                  <br />
                  届かない場合は
                  <button type="button" className={signup_styles.text_button} onClick={handleSendCode} disabled={!canSendCode}>
                    {resendLabel()}
                  </button>
                </span>
              </div>
            )}

            {errorMessage && <p className={signup_styles.error_message}>{errorMessage}</p>}

            {isCodeSent ? (
              <button type="submit" className={signup_styles.submit_button} disabled={!isFormValid || isSubmitting}>
                {isSubmitting ? 'サインイン中...' : 'サインイン'}
              </button>
            ) : (
              <button type="button" className={signup_styles.submit_button} onClick={handleSendCode} disabled={!canSendCode}>
                {isSendingCode ? '送信中...' : '認証コードを送信'}
              </button>
            )}
          </form>

          <div className={signup_styles.footer}>
            アカウントがない場合:
            <Link prefetch={false} href="/signup">
              サインアップ
            </Link>
          </div>

          <div className={signup_styles.divider}>
            <span>または</span>
          </div>

          <button className={styles.anyur_button} onClick={handleOauth} disabled={isOauthLoading}>
            <Image src="https://anyur.com/icon.svg" alt="ANYURのロゴ" width={32} height={32} />
            {isOauthLoading ? '接続中...' : 'ANYURで続ける'}
          </button>
        </div>
      </div>
    </>
  )
}
