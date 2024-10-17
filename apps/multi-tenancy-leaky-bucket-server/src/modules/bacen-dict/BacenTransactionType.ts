import { generateUniqueIntId } from '@woovi/server-utils'
import {
  GraphQLInt,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql'
import { connectionDefinitions, globalIdField } from 'graphql-relay'
import { BacenAccountType, mockAccountData } from './BacenAccountType'
import { bacen } from './database/bacen'

export const mockTransactionData = {
  id: 'transaction:1',
  publicId: generateUniqueIntId(),
  amount: 100,
  pixKey: 'hallex.costa@hotmail.com',
  accountId: 'account:1',
  createdAt: new Date(),
  updatedAt: null
}

export const BacenTransactionType = new GraphQLObjectType({
  name: 'BacenTransaction',
  description: 'Bacen Transactions',
  fields: () => ({
    id: globalIdField('transaction'),
    e2eid: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: (transaction) => transaction.e2eid
    },
    accountId: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: (transaction) => transaction.accountId
    },
    account: {
      type: BacenAccountType,
      resolve: async (transaction) => {
        return bacen.get('accounts')?.get(transaction.accountId)
      }
    },
    destinationPixKey: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: (transaction) => transaction.destinationPixKey
    },
    originPixKey: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: (transaction) => transaction.originPixKey
    },
    createdAt: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: (transaction) =>
        new Date(transaction.createdAt).toISOString().slice(0, 10)
    },
    updatedAt: {
      type: GraphQLString,
      resolve: (transaction) =>
        transaction.updatedAt
          ? new Date(transaction.updatedAt).toISOString().slice(0, 10)
          : null
    }
  })
})

export const {
  connectionType: BacenTransactionConnection,
  edgeType: BacenTransactionEdge
} = connectionDefinitions({
  nodeType: BacenTransactionType,
  name: 'BacenTransaction',
  connectionFields: () => ({
    error: {
      type: GraphQLString,
      description:
        'This field is used to store the message from authenticate of user'
    },
    totalCount: {
      type: GraphQLInt,
      resolve: (connection) => connection.totalCount,
      description: `A count of the total number of objects in this connection, ignoring pagination.
This allows a client to fetch the first five objects by passing "5" as the
argument to "first", then fetch the total count so it could display "5 of 83",
for example.`
    }
  })
})
