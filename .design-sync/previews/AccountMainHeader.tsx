import { AccountMainHeader } from 'Amiverse'
import { account } from './_fixtures'

const noop = () => {}

export const Default = () => <AccountMainHeader account={account} onFollow={noop} />

export const OwnAccount = () => <AccountMainHeader account={account} isOwnAccount onFollow={noop} />
