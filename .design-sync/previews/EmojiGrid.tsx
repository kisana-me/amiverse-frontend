import { useState } from 'react'
import { EmojiGrid } from 'Amiverse'

// `name` carries the character itself when an emoji has no image_url — that is
// what the grid renders.
const emojis = [
  { name: '😀', name_id: 'grinning_face' },
  { name: '🥰', name_id: 'smiling_face_with_hearts' },
  { name: '🎉', name_id: 'party_popper' },
  { name: '✨', name_id: 'sparkles' },
  { name: '🔥', name_id: 'fire' },
  { name: '🎨', name_id: 'artist_palette' },
  { name: '👍', name_id: 'thumbs_up' },
  { name: '🙌', name_id: 'raising_hands' },
  { name: '👏', name_id: 'clapping_hands' },
  { name: '🙏', name_id: 'folded_hands' },
]

const noop = () => {}

const Live = ({ tone = null }: { tone?: string | null }) => {
  const [selectedTone, setSelectedTone] = useState<string | null>(tone)
  return <EmojiGrid emojis={emojis} onEmojiSelect={noop} selectedTone={selectedTone as never} onToneChange={(t) => setSelectedTone(t as string | null)} />
}

export const Default = () => <Live />
