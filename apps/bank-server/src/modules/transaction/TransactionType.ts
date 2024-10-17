import {
  GraphQLInt,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from '@/modules/graphql'
import { connectionDefinitions, globalIdField } from 'graphql-relay'
import { AccountLoader } from '../account/AccountLoader'
import { AccountType } from '../account/AccountType'
import type { TransactionModel } from './TransactionModel'

const TransactionType = new GraphQLObjectType({
  name: 'Transaction',
  description: 'Transactions between peer-to-peer accounts',
  fields: () => ({
    id: globalIdField('transaction'),
    publicId: {
      type: new GraphQLNonNull(GraphQLInt),
      resolve: (transaction) => transaction.publicId
    },
    amount: {
      type: new GraphQLNonNull(GraphQLInt),
      resolve: (transaction) => transaction.amount
    },
    status: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: (transaction) => transaction.status
    },
    type: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: (transaction) => transaction.type
    },
    destinationReceiverAccountId: {
      type: GraphQLString,
      resolve: (transaction) => transaction.destinationReceiverAccountId
    },
    destinationReceiverAccount: {
      type: AccountType,
      resolve: async (transaction: TransactionModel) =>
        await AccountLoader.loadById(transaction.destinationReceiverAccountId)
    },
    originSenderAccountId: {
      type: GraphQLString,
      resolve: (transaction) => transaction.originSenderAccountId
    },
    originSenderAccount: {
      type: AccountType,
      resolve: async (transaction, args, context) => {
        return await AccountLoader.loadById(transaction.originSenderAccountId)
      }
    },
    idempotencyKey: {
      type: GraphQLString,
      resolve: (transaction) => transaction.idempotencyKey
    },
    createdAt: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: (transaction) => new Date(transaction.createdAt).toISOString()
    },
    updatedAt: {
      type: GraphQLString,
      resolve: (transaction) =>
        transaction.updatedAt
          ? new Date(transaction.updatedAt).toISOString()
          : null
    }
  })
})

export const {
  connectionType: TransactionConnection,
  edgeType: TransactionEdge
} = connectionDefinitions({
  nodeType: TransactionType,
  name: 'Transaction',
  connectionFields: () => ({
    totalCount: {
      type: GraphQLInt,
      resolve: (connection) => connection.totalCount,
      description: `A count of the total number of objects in this connection, ignoring pagination.
This allows a client to fetch the first five objects by passing "5" as the
argument to "first", then fetch the total count so it could display "5 of 83",
for example.`
    },
    totalPixIn: {
      type: GraphQLInt,
      resolve: (connection) => connection.totalPixIn
    },
    totalPixOut: {
      type: GraphQLInt,
      resolve: (connection) => connection.totalPixOut
    },
    totalPixInCount: {
      type: GraphQLInt,
      resolve: (connection) => connection.totalPixInCount
    },
    totalPixOutCount: {
      type: GraphQLInt,
      resolve: (connection) => connection.totalPixOutCount
    },
    netFlow: {
      type: GraphQLInt,
      resolve: (connection) => connection.netFlow
    },
    averageTransaction: {
      type: GraphQLInt,
      resolve: (connection) => connection.averageTransaction
    },
    averagePixIn: {
      type: GraphQLInt,
      resolve: (connection) => connection.averagePixIn
    },
    averagePixOut: {
      type: GraphQLInt,
      resolve: (connection) => connection.averagePixOut
    }
  })
})
