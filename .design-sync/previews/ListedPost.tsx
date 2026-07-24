import { ListedPost } from 'Amiverse'
import { post, postWithMedia, quotePost, replyPost, sensitivePost } from './_fixtures'

export const Default = () => <ListedPost post={post} />

export const WithMedia = () => <ListedPost post={postWithMedia} />

export const Quote = () => <ListedPost post={quotePost} />

export const Reply = () => <ListedPost post={replyPost} />

export const Sensitive = () => <ListedPost post={sensitivePost} />
