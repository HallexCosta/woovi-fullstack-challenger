import { GraphQLInt, GraphQLObjectType, GraphQLString } from '@/modules/graphql'
import { connectionDefinitions, globalIdField } from 'graphql-relay'
import { Account } from '../account/AccountModel'
import { AccountType } from '../account/AccountType'

export const UserType: GraphQLObjectType = new GraphQLObjectType({
  name: 'User',
  description: 'Users that creation the account',
  fields: () => ({
    id: globalIdField('user'),
    publicId: {
      type: GraphQLInt,
      resolve: (user) => user.publicId
    },
    account: {
      type: AccountType,
      resolve: async (user) => await Account.findOne({ userId: user.id })
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
      type: GraphQLInt,
      resolve: (user) => new Date(user.createdAt)
    },
    updatedAt: {
      type: GraphQLInt,
      resolve: (user) => new Date(user.updatedAt)
    }
  })
})

export const { connectionType: UserConnection, edgeType: UserEdge } =
  connectionDefinitions({
    nodeType: UserType,
    name: 'User'
  })
