import { SensitiveGate } from 'Amiverse'

const Body = () => <p style={{ padding: 12 }}>ゲートの内側に表示される本文です。</p>

export const General = () => (
  <SensitiveGate rating="general">
    <Body />
  </SensitiveGate>
)

export const Nsfw = () => (
  <SensitiveGate rating="nsfw">
    <Body />
  </SensitiveGate>
)

export const R18 = () => (
  <SensitiveGate rating="r18">
    <Body />
  </SensitiveGate>
)
