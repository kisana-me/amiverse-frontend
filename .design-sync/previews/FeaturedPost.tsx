import { FeaturedPost } from 'Amiverse'
import { post, postWithMedia, postWithDrawings } from './_fixtures'

export const Default = () => <FeaturedPost post={post} />

export const WithMedia = () => <FeaturedPost post={postWithMedia} />

export const WithDrawings = () => <FeaturedPost post={postWithDrawings} />
