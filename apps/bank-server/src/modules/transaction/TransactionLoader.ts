import { type ObjectId, type Schema, Types } from 'mongoose'
import { Transaction, type TransactionModel } from './TransactionModel'
import { pixInAndPixOutMapper } from './mappers/pixInAndPixOutMapper'

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
  async loadByAccountId(accountId: string) {
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
    return transactions.map((transaction) =>
      pixInAndPixOutMapper(accountId, transaction)
    )
  },
  listTransactionsOfYear: async (accountId: string, year: number) => {
    const transactions = await Transaction.find(
      {
        $or: [
          {
            originSenderAccountId: accountId,
            $expr: {
              $eq: [{ $year: '$createdAt' }, year] // Extract year from `createdAt`
            }
          },
          {
            destinationReceiverAccountId: accountId,
            $expr: {
              $eq: [{ $year: '$createdAt' }, year] // Extract year from `createdAt`
            }
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
    return transactions.map((transaction) =>
      pixInAndPixOutMapper(accountId, transaction)
    )
  },
  getTotalPixIn: async (accountId: string, year: number) => {
    // const result = await Transaction.aggregate([
    //   {
    //     $match: {
    //       destinationReceiverAccountId: new Types.ObjectId(accountId)
    //     }
    //   },
    //   {
    //     $group: {
    //       _id: null,
    //       totalPixIn: { $sum: '$amount' }
    //     }
    //   }
    // ])
    console.log({ testando: year })
    const result = await Transaction.aggregate([
      {
        $match: {
          $and: [
            { destinationReceiverAccountId: new Types.ObjectId(accountId) },
            { $expr: { $eq: [{ $year: '$createdAt' }, year] } }
          ]
        }
      },
      {
        $group: {
          _id: null,
          totalPixIn: { $sum: '$amount' }
        }
      }
    ])

    console.log({ accountId, result })

    return result.length > 0 ? result[0].totalPixIn : 0
  },
  getTotalPixOut: async (accountId: string, year: number) => {
    // const result = await Transaction.aggregate([
    //   {
    //     $match: {
    //       originSenderAccountId: new Types.ObjectId(accountId)
    //     }
    //   },
    //   {
    //     $group: {
    //       _id: null,
    //       totalPixIn: { $sum: '$amount' }
    //     }
    //   }
    // ])

    const result = await Transaction.aggregate([
      {
        $match: {
          $and: [
            { originSenderAccountId: new Types.ObjectId(accountId) },
            { $expr: { $eq: [{ $year: '$createdAt' }, year] } }
          ]
        }
      },
      {
        $group: {
          _id: null,
          totalPixOut: { $sum: '$amount' }
        }
      }
    ])

    return result.length > 0 ? result[0].totalPixOut : 0
  },
  getTotalPixInCount: async (accountId: string, year: number) => {
    // const result = await Transaction.aggregate([
    //   {
    //     $match: {
    //       destinationReceiverAccountId: new Types.ObjectId(accountId)
    //     }
    //   },
    //   {
    //     $count: 'pixInCount'
    //   }
    // ])

    const result = await Transaction.aggregate([
      {
        $match: {
          $and: [
            { destinationReceiverAccountId: new Types.ObjectId(accountId) },
            { $expr: { $eq: [{ $year: '$createdAt' }, year] } }
          ]
        }
      },
      {
        $count: 'pixInCount'
      }
    ])

    return result.length > 0 ? result[0].pixInCount : 0
  },
  getTotalPixOutCount: async (accountId: string, year: number) => {
    // const result = await Transaction.aggregate([
    //   {
    //     $match: {
    //       originSenderAccountId: new Types.ObjectId(accountId)
    //     }
    //   },
    //   {
    //     $count: 'pixOutCount'
    //   }
    // ])

    const result = await Transaction.aggregate([
      {
        $match: {
          $and: [
            { originSenderAccountId: new Types.ObjectId(accountId) },
            { $expr: { $eq: [{ $year: '$createdAt' }, year] } }
          ]
        }
      },
      {
        $count: 'pixOutCount'
      }
    ])

    return result.length > 0 ? result[0].pixOutCount : 0
  }
}
