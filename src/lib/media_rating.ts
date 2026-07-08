import { RatingType } from '@/types/post'

type CoverAccount =
  | {
      reveal_sensitive?: boolean
      is_adult?: boolean
    }
  | null
  | undefined

export type MediaCoverState = {
  gated: boolean
  locked: boolean
  defaultRevealed: boolean
}

export function getMediaCoverState(rating: RatingType | undefined, account: CoverAccount): MediaCoverState {
  const gated = rating === 'nsfw' || rating === 'r18'
  const locked = rating === 'r18' && !account?.is_adult
  const defaultRevealed = gated && !locked && !!account?.reveal_sensitive
  return { gated, locked, defaultRevealed }
}
