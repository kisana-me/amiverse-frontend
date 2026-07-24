import { Content } from 'Amiverse'
import { post } from './_fixtures'

export const Default = () => <Content post={post} />

export const LongBody = () => (
  <Content
    post={{
      ...post,
      content:
        '線画のクリンナップに丸一日かかりました。\n' +
        Array.from({ length: 18 }, (_, i) => `${i + 1}. 下描きの線を一本ずつ拾い直す作業はやっぱり時間がかかる。`).join('\n'),
    }}
  />
)
