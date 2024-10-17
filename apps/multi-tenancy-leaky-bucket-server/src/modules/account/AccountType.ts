import DataLoader from 'dataloader'
import { GraphQLInt, GraphQLObjectType, GraphQLString } from 'graphql'
import {
  connectionArgs,
  connectionDefinitions,
  connectionFromArray,
  globalIdField
} from 'graphql-relay'
import type { Types } from 'mongoose'
import { UserLoader } from '../user/UserLoader'
// import { TransactionLoader } from '../transaction/TransactionLoader'
// import { Transaction } from '../transaction/TransactionModel'
// import { TransactionConnection } from '../transaction/TransactionType'
import { UserModel } from '../user/UserModel'
import { UserType } from '../user/UserType'

// const transactionDataLoader = new DataLoader(
// 	async (accountIds: Types.ObjectId[]) => {
// 		console.log(accountIds)

// 		const transactionsFromAccount = []
// 		for (const accountId of accountIds) {
// 			const transactions = await TransactionLoader.loadByAccountId(accountId)

// 			transactionsFromAccount.push(
// 				transactions.filter(
// 					(transaction) =>
// 						transaction.originSenderAccountId.toString() ===
// 						accountId.toString()
// 				)
// 			)
// 		}

// 		return transactionsFromAccount
// 	}
// )

export const AccountType: GraphQLObjectType = new GraphQLObjectType({
  name: 'Account',
  description: 'Accounts',
  fields: () => ({
    id: globalIdField('account'),
    publicId: {
      type: GraphQLInt,
      resolve: (account) => account.publicId
    },
    tenantId: {
      type: GraphQLString,
      resolve: (account) => account.tenantId
    },
    userId: {
      type: GraphQLString,
      resolve: (account) => account.userId
    },
    user: {
      type: UserType,
      resolve: async (account) =>
        await UserLoader.load({
          id: account.userId,
          tenantId: account.tenantId
        })
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
