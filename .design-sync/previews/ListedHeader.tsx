import { ListedHeader } from 'Amiverse'
import { post, quotePost } from './_fixtures'

export const Default = () => <ListedHeader post={post} />

export const OtherAccount = () => <ListedHeader post={quotePost} />
