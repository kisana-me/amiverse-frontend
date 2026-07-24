import { Console } from 'Amiverse'
import { post } from './_fixtures'

export const Default = () => <Console post={post} />

export const Diffused = () => <Console post={{ ...post, is_diffused: true, diffuses_count: 19 }} />
