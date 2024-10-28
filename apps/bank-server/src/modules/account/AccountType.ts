import {
  GraphQLBoolean,
  GraphQLInt,
  GraphQLObjectType,
  GraphQLString
} from '@/modules/graphql'
import DataLoader from 'dataloader'
import {
  connectionArgs,
  connectionDefinitions,
  connectionFromArray,
  globalIdField
} from 'graphql-relay'
import type { Types } from 'mongoose'
import { TransactionLoader } from '../transaction/TransactionLoader'
import { Transaction } from '../transaction/TransactionModel'
import { TransactionConnection } from '../transaction/TransactionType'
import { UserModel } from '../user/UserModel'
import { UserType } from '../user/UserType'

const transactionDataLoader = new DataLoader(
  async (accountIds: Types.ObjectId[]) => {
    console.log(accountIds)

    const transactionsFromAccount = []
    for (const accountId of accountIds) {
      const transactions = await TransactionLoader.loadByAccountId(accountId)

      transactionsFromAccount.push(
        transactions.filter(
          (transaction) =>
            transaction.originSenderAccountId.toString() ===
            accountId.toString()
        )
      )
    }

    return transactionsFromAccount
  }
)

export const AccountType: GraphQLObjectType = new GraphQLObjectType({
  name: 'Account',
  description: 'Accounts from woovi bank',
  fields: () => ({
    id: globalIdField('account'),
    publicId: {
      type: GraphQLInt,
      resolve: (account) => account.publicId
    },
    userId: {
      type: GraphQLString,
      resolve: (account) => account.userId
    },
    user: {
      type: UserType,
      resolve: async (account) => await UserModel.findById(account.userId)
    },
    balance: {
      type: GraphQLInt,
      resolve: (account) => account.balance
    },
    status: {
      type: GraphQLString,
      description: 'status from account',
      resolve: (account) => account.status
    },
    locked: {
      type: GraphQLBoolean,
      description: 'lockedDuration',
      resolve: (account) => account.locked
    },

    lockedDuration: {
      type: GraphQLInt,
      description: 'lockedDuration',
      resolve: (account) => account.locklockedDurationed
    },
    lockTimestamp: {
      type: GraphQLInt,
      description: 'lockTimestamp',
      resolve: (account) => account.lockTimestamp
    },
    transactions: {
      type: TransactionConnection,
      args: connectionArgs,
      description: 'transactions maked for this account',
      resolve: async (account, args) => {
        console.log(account._id)

        const transactions = await transactionDataLoader.load(account._id)
        return connectionFromArray(transactions, args)
      }
    },
    createdAt: {
      type: GraphQLString,
      resolve: (account) => new Date(account.createdAt).toISOString()
    },
    updatedAt: {
      type: GraphQLString,
      resolve: (account) => new Date(account.updatedAt).toISOString()
    }
  })
})

export const { connectionType: AccountConnection, edgeType: AccountEdge } =
  connectionDefinitions({
    nodeType: AccountType,
    name: 'Account'
  })
