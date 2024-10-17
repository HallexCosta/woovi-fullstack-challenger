import type { ObjectId, Schema } from 'mongoose'
import type { TransactionModelDocument } from '../TransactionModel'

export const pixInAndPixOutMapper = (
  accountId: string,
  transaction: TransactionModelDocument
) => {
  const parsedTransaction = transaction.$clone()
  if (transaction.originSenderAccountId.toHexString() === accountId) {
    parsedTransaction.amount = -Math.abs(transaction.amount)
  } else if (
    transaction.destinationReceiverAccountId.toHexString() === accountId
  ) {
    parsedTransaction.amount = Math.abs(transaction.amount)
  }

  return parsedTransaction
}
