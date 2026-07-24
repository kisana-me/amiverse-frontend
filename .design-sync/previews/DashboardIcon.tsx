import { DashboardIcon } from 'Amiverse'

export const Default = () => (
  <span style={{ display: 'inline-flex', color: 'var(--font-color)' }}>
    <DashboardIcon width={32} height={32} />
  </span>
)

export const Active = () => (
  <span style={{ display: 'inline-flex', color: 'var(--link-color)' }}>
    <DashboardIcon active width={32} height={32} />
  </span>
)
