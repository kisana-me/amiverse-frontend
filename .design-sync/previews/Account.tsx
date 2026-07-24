import { Account } from 'Amiverse'
import { account, otherAccount } from './_fixtures'

export const Default = () => <Account {...account} />

export const Alternate = () => <Account {...otherAccount} />
