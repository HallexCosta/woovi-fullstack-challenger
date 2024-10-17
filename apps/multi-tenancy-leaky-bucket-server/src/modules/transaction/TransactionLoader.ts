import type { Schema } from 'mongoose'
import { Transaction, type TransactionModel } from './TransactionModel'

export const TransactionLoader = {
  async loadAll() {
    return await Transaction.find(
      {},
      {},
      {
        sort: {
          createdAt: -1
        }
      }
    )
  },
  async loadByAccountId(accountId: Schema.Types.ObjectId) {
    const transactions = await Transaction.find(
      {
        $or: [
          {
            originSenderAccountId: accountId
          },
          {
            destinationReceiverAccountId: accountId
          }
        ]
      },
      {},
      {
        sort: {
          createdAt: -1
        }
      }
    )
    return transactions.map((transaction) => {
      const parsedTransaction = transaction.$clone()

      if (
        transaction.originSenderAccountId.toHexString() ===
        accountId.toHexString()
      ) {
        parsedTransaction.amount = -Math.abs(transaction.amount)
      } else if (
        transaction.destinationReceiverAccountId.toHexString() ===
        accountId.toHexString()
      ) {
        parsedTransaction.amount = Math.abs(transaction.amount)
      }

      return parsedTransaction
    })
  }
}
