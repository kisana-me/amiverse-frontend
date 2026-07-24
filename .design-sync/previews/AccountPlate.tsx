import { AccountPlate } from 'Amiverse'
import { account, otherAccount } from './_fixtures'

const noop = () => {}

export const Default = () => <AccountPlate account={account} onFollow={noop} onMenu={noop} />

export const Following = () => <AccountPlate account={{ ...otherAccount, is_following: true }} onFollow={noop} onMenu={noop} />

export const OwnAccount = () => <AccountPlate account={account} isOwnAccount onFollow={noop} onMenu={noop} />
