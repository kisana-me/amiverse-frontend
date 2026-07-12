'use client'

import styles from './styles.module.css'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useNotifications } from '@/providers/NotificationsProvider'
import HomeIcon from '@/components/icons/HomeIcon'
import DiscoveryIcon from '@/components/icons/DiscoveryIcon'
import DashboardIcon from '@/components/icons/DashboardIcon'
import NotificationsIcon from '@/components/icons/NotificationsIcon'
import CommunitiesIcon from '@/components/icons/CommunitiesIcon'

export default function BottomNav() {
  const pathname = usePathname()
  const { unreadCount } = useNotifications()

  return (
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
          {unreadCount > 0 && <div className={styles.notifications_count}>{unreadCount > 99 ? '99+' : unreadCount}</div>}
          <NotificationsIcon active={pathname == '/notifications'} />
        </div>
        <div className={styles.text}>通知</div>
      </Link>
      <Link prefetch={false} href="/communities" className={styles.link}>
        <div className={styles.icon}>
          <CommunitiesIcon active={pathname == '/communities'} />
        </div>
        <div className={styles.text}>つながり</div>
      </Link>
    </nav>
  )
}
