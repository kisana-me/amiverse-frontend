import { AccountProfile } from 'Amiverse'
import { account, otherAccount } from './_fixtures'

export const Default = () => <AccountProfile account={account} />

export const Minimal = () => <AccountProfile account={otherAccount} />
