import { generateUniqueIntId } from '@woovi/server-utils'
import { GraphQLInt, GraphQLObjectType, GraphQLString } from 'graphql'
import { connectionDefinitions, globalIdField } from 'graphql-relay'

export const mockAccountData = {
  id: 'account:1',
  publicId: generateUniqueIntId(),
  status: 'PAID',
  createdAt: new Date(),
  updatedAt: null
}
export const BacenAccountType: GraphQLObjectType = new GraphQLObjectType({
  name: 'BacenAccount',
  description: 'Bacen Accounts',
  fields: () => ({
    id: globalIdField('account'),
    publicId: {
      type: GraphQLInt,
      resolve: (account) => account.publicId
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

export const {
  connectionType: BacenAccountConnection,
  edgeType: BacenAccountEdge
} = connectionDefinitions({
  nodeType: BacenAccountType,
  name: 'BacenAccount'
})
