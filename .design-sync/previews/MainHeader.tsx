import { MainHeader } from 'Amiverse'

export const Default = () => (
  <MainHeader>
    <span style={{ fontWeight: 700 }}>ホーム</span>
  </MainHeader>
)

export const WithTabs = () => (
  <MainHeader>
    <div style={{ display: 'flex', gap: 16 }}>
      <span style={{ fontWeight: 700, borderBottom: '2px solid var(--link-color)' }}>おすすめ</span>
      <span style={{ color: 'var(--inconspicuous-font-color)' }}>フォロー中</span>
    </div>
  </MainHeader>
)
