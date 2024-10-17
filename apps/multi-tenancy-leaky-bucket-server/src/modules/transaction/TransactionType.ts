import {
  GraphQLInt,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from '@/modules/graphql'
import { connectionDefinitions, globalIdField } from 'graphql-relay'
import { TenantLoader } from '../tenant/TenantLoader'
import { TenantType } from '../tenant/TenantType'
import { UserLoader } from '../user/UserLoader'
import { UserType } from '../user/UserType'

export const TransactionType = new GraphQLObjectType({
  name: 'Transaction',
  description: 'Transactions to some bank entity',
  fields: () => ({
    id: globalIdField('transaction'),
    tenantId: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: (transaction) => transaction.tenantId
    },
    tenant: {
      type: TenantType,
      resolve: async (transaction) =>
        await TenantLoader.load({
          id: transaction.tenantId
        })
    },
    destinationUserId: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: (transaction) => transaction.destinationUserId
    },
    destinationUser: {
      type: UserType,
      resolve: async (transaction) =>
        await UserLoader.load({
          id: transaction.destinationUserId,
          tenantId: transaction.tenantId
        })
    },
    originUserId: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: (transaction) => transaction.originUserId
    },
    originUser: {
      type: UserType,
      resolve: async (transaction) => {
        const originUser = await UserLoader.load({
          id: transaction.originUserId,
          tenantId: transaction.tenantId
        })

        console.log({ originUser: transaction.originUserId })
        return originUser
      }
    },
    publicId: {
      type: new GraphQLNonNull(GraphQLInt),
      resolve: (transaction) => transaction.publicId
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
  connectionType: TransactionConnection,
  edgeType: TransactionEdge
} = connectionDefinitions({
  nodeType: TransactionType,
  name: 'Transaction',
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
