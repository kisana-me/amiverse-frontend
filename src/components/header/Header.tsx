'use client'

import styles from './styles.module.css'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCurrentAccount } from '@/providers/CurrentAccountProvider'
import { useOverlay } from '@/providers/OverlayProvider'
import { useNotifications } from '@/providers/NotificationsProvider'
import HomeIcon from '@/components/icons/HomeIcon'
import DiscoveryIcon from '@/components/icons/DiscoveryIcon'
import DashboardIcon from '@/components/icons/DashboardIcon'
import NotificationsIcon from '@/components/icons/NotificationsIcon'
import CommunitiesIcon from '@/components/icons/CommunitiesIcon'
import SettingsIcon from '@/components/icons/SettingsIcon'
import PostIcon from '@/components/icons/PostIcon'
import AccountCircleIcon from '@/components/icons/AccountCircleIcon'

export default function Header() {
  const pathname = usePathname()
  const { currentAccount, currentAccountStatus } = useCurrentAccount()
  const { isHeaderMenuOpen } = useOverlay()
  const { unreadCount } = useNotifications()

  const renderCurrentAccountStatus = () => {
    if (currentAccountStatus === 'signed_in' && currentAccount) {
      return (
        <Link prefetch={false} href={'/@' + currentAccount.name_id} className={styles.link}>
          <div className={styles.icon}>
            <img src={currentAccount.icon_url} className={styles.image} />
          </div>
          <div className={styles.text}>{currentAccount.name}</div>
        </Link>
      )
    }

    if (currentAccountStatus === 'signed_out') {
      return (
        <Link prefetch={false} href="/signin" className={styles.link}>
          <div className={styles.icon}>
            <AccountCircleIcon />
          </div>
          <div className={styles.text}>はじめる</div>
        </Link>
      )
    }

    return (
      <Link prefetch={false} href="/signin" className={styles.link}>
        <div className={styles.icon}>
          <AccountCircleIcon />
        </div>
        <div className={styles.text}>読み込み中</div>
      </Link>
    )
  }

  return (
    <header className={`${styles.header} ${isHeaderMenuOpen && styles.show_header}`}>
      <div className={styles.logo}>
        <Link prefetch={false} href="/" className={styles.link}>
          <div className={styles.icon}>
            <img src="/static-assets/images/amiverse-logo-alpha-400.png" className={styles.image} />
          </div>
          <div className={styles.text}>Amiverse</div>
        </Link>
      </div>
      <nav className={styles.nav}>
        <Link prefetch={false} href="/" className={styles.link}>
          <div className={styles.icon}>
            <HomeIcon active={pathname == '/'} />
          </div>
          <div className={styles.text}>ホーム</div>
        </Link>
        <Link prefetch={false} href="/discovery" className={styles.link}>
          <div className={styles.icon}>
            <DiscoveryIcon active={pathname == '/discovery'} />
          </div>
          <div className={styles.text}>探索</div>
        </Link>
        <Link prefetch={false} href="/dashboard" className={styles.link}>
          <div className={styles.icon}>
            <DashboardIcon active={pathname == '/dashboard'} />
          </div>
          <div className={styles.text}>いろいろ</div>
        </Link>
        <Link prefetch={false} href="/notifications" className={styles.link}>
          <div className={styles.icon} style={{ position: 'relative' }}>
            {unreadCount > 0 && <div className={styles.notifications_count}>{unreadCount > 99 ? '++' : unreadCount}</div>}
            <NotificationsIcon active={pathname == '/notifications'} />
          </div>
          <div className={styles.text}>通知</div>
        </Link>
        <Link prefetch={false} href="/communities" className={styles.link}>
          <div className={styles.icon}>
            <CommunitiesIcon active={pathname.startsWith('/communities')} />
          </div>
          <div className={styles.text}>つながり</div>
        </Link>
        <Link prefetch={false} href="/posts/new" className={`${styles.link} ${styles.post}`}>
          <div className={styles.icon}>
            <PostIcon />
          </div>
          <div className={styles.text}>投稿</div>
        </Link>
      </nav>
      <div className={styles.bottom}>
        {renderCurrentAccountStatus()}
        <Link prefetch={false} href="/settings" className={styles.link}>
          <div className={styles.icon}>
            <SettingsIcon active={false} />
          </div>
          <div className={styles.text}>設定</div>
        </Link>
      </div>
    </header>
  )
}
