import {
  GraphQLInt,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from '@/modules/graphql'
import { connectionArgs, connectionFromArray, toGlobalId } from 'graphql-relay'

import { AccountLoader } from '@/modules/account/AccountLoader'
import { Account } from '@/modules/account/AccountModel'
import { AccountConnection, AccountEdge } from '@/modules/account/AccountType'
import { TransactionLoader } from '@/modules/transaction/TransactionLoader'
import { Transaction } from '@/modules/transaction/TransactionModel'
import { TransactionConnection } from '@/modules/transaction/TransactionType'

export const query = new GraphQLObjectType({
  name: 'Query',
  description: 'The root bank server queries',
  fields: () => ({
    accounts: {
      type: AccountConnection,
      args: connectionArgs, // first, after, before, last
      resolve: async (_, args, context) => {
        const accounts = await AccountLoader.loadAll()

        return connectionFromArray(accounts, args)
      }
    },
    accountByPublicId: {
      type: AccountEdge,
      args: {
        publicId: { type: GraphQLInt }
      },
      resolve: async (_, { publicId }, context) => {
        const account = await AccountLoader.loadByPublicId(publicId)
        if (!account) return null

        return {
          cursor: toGlobalId('Account', account.id),
          node: account
        }
      }
    },
    transactions: {
      type: TransactionConnection,
      args: {
        ...connectionArgs,
        accountPublicId: {
          type: GraphQLInt
        }
      },
      resolve: async (_, { accountPublicId, ...args }, context) => {
        console.log({ connectionArgs })

        if (!accountPublicId) {
          return connectionFromArray(await TransactionLoader.loadAll(), args)
        }

        const account = await Account.findOne({
          publicId: accountPublicId
        })

        if (!account) return null

        const transactions = await TransactionLoader.loadByAccountId(
          account._id
        )
        const totalCount = await Transaction.countDocuments()

        const connectionOutput = connectionFromArray(transactions, args)
        Object.assign(connectionOutput, { totalCount })
        return connectionOutput
      }
    },
    transactionsByAccountPublicId: {
      type: TransactionConnection,
      args: {
        accountPublicId: { type: new GraphQLNonNull(GraphQLInt) },
        ...connectionArgs
      },
      resolve: async (_, { accountPublicId, ...args }, context) => {
        const account = await Account.findOne({
          publicId: accountPublicId
        })
        if (!account) return

        const transactions = await TransactionLoader.loadByAccountId(account.id)
        return connectionFromArray(transactions, args)
      }
    },
    transactionsOfYear: {
      type: TransactionConnection,
      args: {
        accountPublicId: { type: new GraphQLNonNull(GraphQLInt) },
        year: {
          type: GraphQLInt
        },
        ...connectionArgs
      },
      resolve: async (_, { accountPublicId, year, ...args }, context) => {
        const account = await Account.findOne({
          publicId: accountPublicId
        })
        if (!account) return

        const defaultYear = new Date().getFullYear()
        const transactions = await TransactionLoader.listTransactionsOfYear(
          account.id,
          year ?? defaultYear
        )

        const [totalPixIn, totalPixOut] = await Promise.all([
          TransactionLoader.getTotalPixIn(account.id, year ?? defaultYear),
          TransactionLoader.getTotalPixOut(account.id, year ?? defaultYear)
        ])

        const totalPixInCount = await TransactionLoader.getTotalPixInCount(
          account.id,
          year ?? defaultYear
        )
        const totalPixOutCount = await TransactionLoader.getTotalPixInCount(
          account.id,
          year ?? defaultYear
        )

        const netFlow = totalPixIn - totalPixOut
        const averagePixIn = Math.ceil(totalPixIn / totalPixInCount)
        const averagePixOut = Math.ceil(totalPixOut / totalPixOutCount)
        const averageTransaction = Math.ceil(
          (averagePixIn + averagePixOut) / (totalPixInCount + totalPixOutCount)
        )

        return Object.assign(connectionFromArray(transactions, args), {
          netFlow,
          totalPixIn,
          totalPixOut,
          totalPixInCount,
          totalPixOutCount,
          averagePixIn,
          averagePixOut,
          averageTransaction
        })
      }
    }
  })
})
