import { Account } from './AccountModel'

type LoadProps = {
  id?: string
  publicId?: number
  userId?: string
  tenantId?: string
}
export const AccountLoader = {
  load: async (props: LoadProps) => {
    const filters = {}

    for (const [key, value] of Object.entries(props)) {
      if (value) Object.assign(filters, { [key]: value })
    }

    return await Account.findOne(filters)
  },
  loadAll: async () => {
    const accounts = await Account.find()

    return accounts
  }
}
