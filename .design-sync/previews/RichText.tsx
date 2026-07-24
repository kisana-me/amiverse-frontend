import { RichText } from 'Amiverse'

export const Default = () => <RichText content={'夕方の川辺をスケッチしてきました。 #スケッチ\n感想は @hinata まで、作品はこちら https://example.com/gallery/river-sketch'} />

export const PlainText = () => <RichText content="装飾のない普通の本文です。" />

export const Collapsed = () => <RichText content={Array.from({ length: 24 }, (_, i) => `${i + 1} 行目のテキスト。600文字か16行を超えると「もっと見る」で折りたたまれます。`).join('\n')} />
