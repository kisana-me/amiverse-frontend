import { OneLine } from 'Amiverse'
import { account, otherAccount } from './_fixtures'

export const Default = () => <OneLine account={account} />

export const WithTrailing = () => (
  <OneLine account={otherAccount}>
    <button style={{ padding: '4px 12px', borderRadius: 999, border: '1px solid var(--border-color)', color: 'var(--font-color)' }}>フォロー中</button>
  </OneLine>
)
