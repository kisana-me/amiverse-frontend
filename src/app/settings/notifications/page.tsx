'use client'

import React, { useEffect, useState } from 'react'
import styles from './styles.module.css'
import MainHeader from '@/components/main_header/MainHeader'
import { api } from '@/lib/axios'
import { useToast } from '@/providers/ToastProvider'
import { useNotifications, WEBPUSH_OPT_OUT_KEY } from '@/providers/NotificationsProvider'
import { useCurrentAccount } from '@/providers/CurrentAccountProvider'

type WebpushDevice = {
  id: number
  name: string
  current: boolean
  created_at: string
  updated_at: string
}

// 現在の端末のPush購読エンドポイントを取得する（未購読ならnull）
const getCurrentEndpoint = async (): Promise<string | null> => {
  try {
    if (!('serviceWorker' in navigator)) return null
    const registration = await navigator.serviceWorker.getRegistration()
    const subscription = await registration?.pushManager.getSubscription()
    return subscription?.endpoint ?? null
  } catch {
    return null
  }
}

type NotificationSetting = {
  reaction: boolean
  diffuse: boolean
  reply: boolean
  quote: boolean
  follow: boolean
  mention: boolean
  wp_reaction: boolean
  wp_diffuse: boolean
  wp_reply: boolean
  wp_quote: boolean
  wp_follow: boolean
  wp_mention: boolean
}

const SETTING_LABELS: { [key: string]: string } = {
  reaction: 'リアクション',
  diffuse: '拡散',
  reply: '返信',
  quote: '引用',
  follow: 'フォロー',
  mention: 'メンション',
}

const SETTING_KEYS = ['reaction', 'diffuse', 'reply', 'quote', 'follow', 'mention'] as const

export default function NotificationSettingsPage() {
  const [settings, setSettings] = useState<NotificationSetting | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [devices, setDevices] = useState<WebpushDevice[]>([])
  const [isDevicesLoading, setIsDevicesLoading] = useState(true)
  const { addToast } = useToast()
  const { permission, subscribeToPush } = useNotifications()
  const { currentAccountStatus } = useCurrentAccount()

  useEffect(() => {
    if (currentAccountStatus === 'signed_in') {
      fetchSettings()
      fetchDevices()
    } else if (currentAccountStatus === 'signed_out') {
      setIsLoading(false)
      setIsDevicesLoading(false)
    }
  }, [currentAccountStatus])

  const fetchSettings = async () => {
    try {
      const response = await api.post('/settings/notification')
      setSettings(response.data.setting)
    } catch (error) {
      console.error('Failed to fetch notification settings:', error)
      addToast({
        message: 'エラー',
        detail: '設定の取得に失敗しました',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateSetting = async (key: keyof NotificationSetting, value: boolean) => {
    if (!settings) return

    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings) // Optimistic update

    try {
      await api.post('/settings/update_notification', {
        setting: { [key]: value },
      })
    } catch (error) {
      console.error('Failed to update notification setting:', error)
      setSettings(settings) // Revert on error
      addToast({
        message: 'エラー',
        detail: '設定の更新に失敗しました',
      })
    }
  }

  const fetchDevices = async () => {
    try {
      const endpoint = await getCurrentEndpoint()
      const response = await api.post('/webpush_subscriptions/list', { endpoint })
      setDevices(response.data.data)
    } catch (error) {
      console.error('Failed to fetch webpush devices:', error)
      addToast({
        message: 'エラー',
        detail: '端末リストの取得に失敗しました',
      })
    } finally {
      setIsDevicesLoading(false)
    }
  }

  const unsubscribeDevice = async (device: WebpushDevice) => {
    try {
      await api.delete(`/webpush_subscriptions/${device.id}`)

      // 現在の端末ならブラウザ側のPush購読も解除し、自動再購読しないようにする
      if (device.current) {
        localStorage.setItem(WEBPUSH_OPT_OUT_KEY, '1')
        try {
          const registration = await navigator.serviceWorker.getRegistration()
          const subscription = await registration?.pushManager.getSubscription()
          await subscription?.unsubscribe()
        } catch (error) {
          console.error('Failed to unsubscribe browser push subscription:', error)
        }
      }

      setDevices((prev) => prev.filter((d) => d.id !== device.id))
      addToast({
        message: '通知を解除しました',
        detail: `${device.name || '端末'}への通知を解除しました`,
      })
    } catch (error) {
      console.error('Failed to unsubscribe webpush device:', error)
      addToast({
        message: 'エラー',
        detail: '通知の解除に失敗しました',
      })
    }
  }

  const handleSubscribeThisDevice = async () => {
    await subscribeToPush()
    await fetchDevices()
  }

  const handlePushPermission = async () => {
    if (permission === 'default') {
      await subscribeToPush()
      await fetchDevices()
    }
  }

  if (isLoading) {
    return (
      <>
        <MainHeader>通知設定</MainHeader>
        <div className="p-4 text-center">読み込み中...</div>
      </>
    )
  }

  return (
    <>
      <MainHeader>通知設定</MainHeader>
      <div className="max-w-2xl mx-auto p-4 pb-20">
        {permission === 'denied' && (
          <div
            style={{
              marginBottom: '1.5rem',
              padding: '1rem',
              backgroundColor: 'var(--inconspicuous-background-color)',
              border: '1px solid var(--border-color)',
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <h3 style={{ fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '0.25rem', color: 'var(--font-color)' }}>通知がブロックされています</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--inconspicuous-font-color)' }}>ブラウザの設定から通知を許可に変更後、再読み込みしてください</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginLeft: '1rem',
                padding: '0.375rem 0.75rem',
                backgroundColor: 'var(--content-color)',
                border: '1px solid var(--border-color)',
                color: 'var(--font-color)',
                borderRadius: '0.25rem',
                fontSize: '0.75rem',
                fontWeight: 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              再読み込み
            </button>
          </div>
        )}

        {permission === 'default' && (
          <div
            style={{
              marginBottom: '1.5rem',
              padding: '1rem',
              backgroundColor: 'var(--inconspicuous-background-color)',
              border: '1px solid var(--border-color)',
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <h3 style={{ fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '0.25rem', color: 'var(--font-color)' }}>プッシュ通知の設定</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--inconspicuous-font-color)' }}>ブラウザの通知を受け取るには許可が必要です</p>
            </div>
            <button
              onClick={handlePushPermission}
              style={{
                marginLeft: '1rem',
                padding: '0.375rem 0.75rem',
                backgroundColor: 'var(--content-color)',
                border: '1px solid var(--border-color)',
                color: 'var(--font-color)',
                borderRadius: '0.25rem',
                fontSize: '0.75rem',
                fontWeight: 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              通知を許可
            </button>
          </div>
        )}

        <div className="space-y-6">
          <div className="grid grid-cols-[1fr_auto_auto] gap-4 items-center border-b border-gray-200 dark:border-gray-800 pb-2 mb-4">
            <div className="font-bold text-gray-500 dark:text-gray-400 text-sm">通知タイプ</div>
            <div className="font-bold text-gray-500 dark:text-gray-400 text-sm text-center w-16">アプリ内</div>
            <div className="font-bold text-gray-500 dark:text-gray-400 text-sm text-center w-16">プッシュ</div>
          </div>

          {settings &&
            SETTING_KEYS.map((key) => (
              <div key={key} className="grid grid-cols-[1fr_auto_auto] gap-4 items-center py-2">
                <div className="font-medium">{SETTING_LABELS[key]}</div>

                {/* App Notification Toggle */}
                <div className="flex justify-center w-16">
                  <Switch checked={settings[key]} onChange={(checked) => updateSetting(key, checked)} />
                </div>

                {/* WebPush Notification Toggle */}
                <div className="flex justify-center w-16">
                  <Switch
                    checked={settings[`wp_${key}` as keyof NotificationSetting]}
                    onChange={(checked) => updateSetting(`wp_${key}` as keyof NotificationSetting, checked)}
                    disabled={permission !== 'granted'}
                  />
                </div>
              </div>
            ))}
        </div>

        <div className={styles.devicesSection}>
          <h2 className={styles.devicesTitle}>通知を受け取る端末</h2>
          <p className={styles.devicesDescription}>プッシュ通知が登録されている端末の一覧です。端末ごとに通知を解除できます。</p>

          {isDevicesLoading ? (
            <div className={styles.devicesEmpty}>読み込み中...</div>
          ) : devices.length === 0 ? (
            <div className={styles.devicesEmpty}>通知を受け取っている端末はありません</div>
          ) : (
            <div className={styles.deviceList}>
              {devices.map((device) => (
                <div key={device.id} className={styles.deviceItem}>
                  <div className={styles.deviceInfo}>
                    <div className={styles.deviceName}>
                      {device.name || '不明な端末'}
                      {device.current && <span className={styles.deviceBadge}>この端末</span>}
                    </div>
                    <div className={styles.deviceDate}>登録: {new Date(device.created_at).toLocaleDateString()}</div>
                  </div>
                  <button className={styles.deviceUnsubscribeButton} onClick={() => unsubscribeDevice(device)}>
                    解除
                  </button>
                </div>
              ))}
            </div>
          )}

          {permission === 'granted' && !isDevicesLoading && !devices.some((device) => device.current) && (
            <button className={styles.deviceSubscribeButton} onClick={handleSubscribeThisDevice}>
              この端末で通知を受け取る
            </button>
          )}
        </div>
      </div>
    </>
  )
}

function Switch({ checked, onChange, disabled = false }: { checked: boolean; onChange: (checked: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`
        relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${checked ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <span
        aria-hidden="true"
        className={`
          pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
          ${checked ? 'translate-x-5' : 'translate-x-0'}
        `}
      />
    </button>
  )
}
