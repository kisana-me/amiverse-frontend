import { Reactions } from 'Amiverse'
import { post } from './_fixtures'

export const Default = () => <Reactions post={post} />

export const Many = () => (
  <Reactions
    post={{
      ...post,
      reactions_count: 96,
      reactions: [
        ...post.reactions!,
        { name: '🎉', name_id: 'party_popper', reactions_count: 18, reacted: false },
        { name: '🔥', name_id: 'fire', reactions_count: 15, reacted: true },
        { name: '🙏', name_id: 'folded_hands', reactions_count: 9, reacted: false },
        { name: '😂', name_id: 'face_with_tears_of_joy', reactions_count: 7, reacted: false },
      ],
    }}
  />
)
