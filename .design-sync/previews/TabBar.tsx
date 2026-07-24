import { useState } from 'react'
import { TabBar } from 'Amiverse'

const tabs = [
  { key: 'posts', label: '投稿' },
  { key: 'replies', label: '返信' },
  { key: 'media', label: 'メディア' },
  { key: 'drawings', label: 'お絵かき' },
]

const Live = ({ initial = 'posts' }: { initial?: string }) => {
  const [active, setActive] = useState(initial)
  return <TabBar tabs={tabs} activeTab={active} onTabChange={setActive} />
}

export const Default = () => <Live />

export const SecondTabActive = () => <Live initial="media" />
