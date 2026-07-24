import { PostHeader } from 'Amiverse'
import { post } from './_fixtures'

export const Default = () => <PostHeader post={post} />

export const Featured = () => <PostHeader post={post} featured />
