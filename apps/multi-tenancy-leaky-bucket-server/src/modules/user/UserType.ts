import { GraphQLInt, GraphQLObjectType, GraphQLString } from 'graphql'
import { connectionDefinitions, globalIdField } from 'graphql-relay'
import { Account } from '../account/AccountModel'
import { AccountType } from '../account/AccountType'
import { TenantLoader } from '../tenant/TenantLoader'
import { TenantType } from '../tenant/TenantType'

import { ObjectId } from 'mongoose'

export const UserType: GraphQLObjectType = new GraphQLObjectType({
  name: 'User',
  description: 'Users that creation the account',
  fields: () => ({
    id: globalIdField('user'),
    publicId: {
      type: GraphQLInt,
      resolve: (user) => user.publicId
    },
    tenantId: {
      type: GraphQLString,
      resolve: (user) => user.tenantId
    },
    account: {
      type: AccountType,
      resolve: async (user) => await Account.findOne({ userId: user.id })
    },
    tenant: {
      type: TenantType,
      resolve: async (user) => {
        console.log('tenantId', user.tenantId)
        return await TenantLoader.load({ id: user.tenantId })
      }
    },
    fullName: {
      type: GraphQLString,
      resolve: (user) => user.fullName
    },
    email: {
      type: GraphQLString,
      resolve: (user) => user.email
    },
    pixKey: {
      type: GraphQLString,
      resolve: (user) => user.pixKey
    },
    profileImage: {
      type: GraphQLString,
      resolve: (user) => user.profileImage
    },
    createdAt: {
      type: GraphQLString,
      resolve: (user) =>
        user.createdAt ? new Date(user.createdAt).toISOString() : null
    },
    updatedAt: {
      type: GraphQLString,
      resolve: (user) =>
        user.updatedAt ? new Date(user.updatedAt).toISOString() : null
    }
  })
})

export const { connectionType: UserConnection, edgeType: UserEdge } =
  connectionDefinitions({
    nodeType: UserType,
    name: 'User',
    connectionFields: () => ({
      error: {
        type: GraphQLString,
        description:
          'This field is used to store the message from authenticate of user'
      }
    })
  })
