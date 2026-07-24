import { Media } from 'Amiverse'
import { postWithMedia } from './_fixtures'

export const TwoImages = () => <Media post={postWithMedia} />

export const SingleImage = () => <Media post={{ ...postWithMedia, media: postWithMedia.media!.slice(0, 1) }} />
