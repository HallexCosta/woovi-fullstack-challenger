import { getCounter } from '@/__tests__/setup/utils/counters/getCounter'
import { Account } from '@/modules/account/AccountModel'
import {
  Transaction,
  type TransactionModelDocument
} from '@/modules/transaction/TransactionModel'
import { getOrCreate } from '../utils/getOrCreate'
import { createAccount } from './createAccount'

export const createTransaction = async (
  args: Partial<TransactionModelDocument> = {}
) => {
  const i = getCounter('transaction')

  const props = Object.assign(
    {
      amount: 100
    },
    args
  )
  if (!props.accountId) {
    const originAccount = await getOrCreate(Account, createAccount)

    props.accountId = originAccount._id
  }

  return new Transaction(props).save()
}
