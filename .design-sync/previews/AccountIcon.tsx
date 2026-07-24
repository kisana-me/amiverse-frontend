import { AccountIcon } from 'Amiverse'
import { account, otherAccount } from './_fixtures'

export const Default = () => <AccountIcon {...account} />

export const Alternate = () => <AccountIcon {...otherAccount} />
