import { mongooseUtils } from '@woovi/server-utils'
import { Account } from './AccountModel'

type LoadFilters = {
  publicId?: number
  userId?: string
  id?: string
}

export const AccountLoader = {
  loadByPublicId: async (publicId: number) =>
    await Account.findOne({
      publicId
    }),
  loadById: async (id: string) => await Account.findById(id),
  load: async (props: LoadFilters) =>
    await Account.findOne(mongooseUtils.toLoadFilters(props)),
  loadAll: async () => {
    const accounts = await Account.find()

    return accounts
  }
}
