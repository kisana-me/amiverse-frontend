import { DiscoveryIcon } from 'Amiverse'

export const Default = () => (
  <span style={{ display: 'inline-flex', color: 'var(--font-color)' }}>
    <DiscoveryIcon width={32} height={32} />
  </span>
)

export const Active = () => (
  <span style={{ display: 'inline-flex', color: 'var(--link-color)' }}>
    <DiscoveryIcon active width={32} height={32} />
  </span>
)
