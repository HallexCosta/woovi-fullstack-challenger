import { getCounter } from '@/__tests__/setup/utils/counters/getCounter'
import { generateUniqueIntId } from '@/common/generateUniqueIntId'
import {
  Account,
  AccountModel,
  type AccountModelDocument
} from '@/modules/account/AccountModel'
import { UserModel } from '@/modules/user/UserModel'
import { getOrCreate } from '../utils/getOrCreate'
import { createUser } from './createUser'

export const createAccount = async (
  args: Partial<AccountModelDocument> = {}
) => {
  const i = getCounter('account')

  const props = Object.assign(
    {
      publicId: generateUniqueIntId()
    },
    args
  )

  if (!props.userId) {
    const user = await getOrCreate(UserModel, createUser)
    props.userId = user.id
  }

  return new Account(props).save()
}
