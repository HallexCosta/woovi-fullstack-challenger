import { getCounter } from '@/__tests__/setup/utils/counters/getCounter'
import { Account } from '@/modules/account/AccountModel'
import {
  Transaction,
  TransactionModel,
  type TransactionModelDocument
} from '@/modules/transaction/TransactionModel'
import mongoose from 'mongoose'
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
  if (!props.originSenderAccountId) {
    const originAccount = await getOrCreate(Account, createAccount)

    props.originSenderAccountId = originAccount._id
  }

  if (!props.destinationReceiverAccountId) {
    const destAccount = await getOrCreate(Account, createAccount, true)

    props.destinationReceiverAccountId = destAccount._id
  }

  return new Transaction(props).save()
}
