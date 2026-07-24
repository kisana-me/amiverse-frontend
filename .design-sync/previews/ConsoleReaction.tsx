import { ConsoleReaction } from 'Amiverse'
import { post } from './_fixtures'

export const Default = () => <ConsoleReaction post={post} />

export const NotReacted = () => <ConsoleReaction post={{ ...post, is_reacted: false }} />
