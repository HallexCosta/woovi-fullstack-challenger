import { middlewareUserBearerTokenAuthorization } from '@/entrypoint/middlewares/middlewareUserBearerAuthorization'
import { AccountLoader } from '@/modules/account/AccountLoader'
import { AccountConnection } from '@/modules/account/AccountType'
import { TenantLoader } from '@/modules/tenant/TenantLoader'
import { TenantConnection, TenantEdge } from '@/modules/tenant/TenantType'
import { UserLoader } from '@/modules/user/UserLoader'
import { UserConnection } from '@/modules/user/UserType'
import { left } from '@woovi/server-utils'
import { GraphQLInt, GraphQLNonNull, GraphQLObjectType } from 'graphql'
import { connectionArgs, connectionFromArray, toGlobalId } from 'graphql-relay'

// const checkAuthMiddleware = (next) => (parent, args, context, info) => {
// 	if (!context.user) {
// 		// throw new Error('Unauthorized')
// 		return left('Unauthorized')
// 	}
// 	return next(parent, args, context, info) // Proceed if authenticated
// }

export const query = new GraphQLObjectType({
  name: 'Query',
  description: 'The root bank server queries',
  fields: () => ({
    accounts: {
      type: AccountConnection,
      args: connectionArgs, // first, after, before, last
      resolve: middlewareUserBearerTokenAuthorization(
        'query',
        async (_, args, context) => {
          const accounts = await AccountLoader.loadAll()
          return connectionFromArray(accounts, args)
        }
      )
    },
    tenant: {
      type: TenantEdge,
      args: {
        publicId: {
          type: new GraphQLNonNull(GraphQLInt)
        }
      },
      resolve: async (_, { publicId, ...args }, context) => {
        const tenant = await TenantLoader.load({
          publicId
        })

        if (!tenant) return null

        return {
          cursor: toGlobalId('Tenant', tenant.id),
          node: tenant
        }
      }
    },
    tenants: {
      type: TenantConnection,
      args: connectionArgs,
      resolve: async (_, { publicId, ...args }, context) => {
        const tenants = await TenantLoader.loadAll()

        return connectionFromArray(tenants, args)
      }
    },
    users: {
      type: UserConnection,
      args: connectionArgs,
      resolve: middlewareUserBearerTokenAuthorization(
        'query',
        async (_, args, context) => {
          const users = await UserLoader.loadAll()

          return connectionFromArray(users, args)
        }
      )
    }
    // accountByPublicId: {
    // 	type: AccountEdge,
    // 	args: {
    // 		publicId: { type: GraphQLInt }
    // 	},
    // 	resolve: async (_, { publicId }, context) => {
    // 		const account = await AccountLoader.loadByPublicId(publicId)
    // 		if (!account) return null
    // 		return {
    // 			cursor: toGlobalId('Account', account.id),
    // 			node: account
    // 		}
    // 	}
    // },
    // transactions: {
    // 	type: TransactionConnection,
    // 	args: {
    // 		...connectionArgs,
    // 		accountPublicId: {
    // 			type: GraphQLInt
    // 		}
    // 	},
    // 	resolve: async (_, { accountPublicId, ...args }, context) => {
    // 		console.log({ connectionArgs })
    // 		if (!accountPublicId) {
    // 			return connectionFromArray(await TransactionLoader.loadAll(), args)
    // 		}
    // 		const account = await Account.findOne({
    // 			publicId: accountPublicId
    // 		})
    // 		if (!account) return null
    // 		const transactions = await TransactionLoader.loadByAccountId(
    // 			account._id
    // 		)
    // 		const totalCount = await Transaction.countDocuments()
    // 		const connectionOutput = connectionFromArray(transactions, args)
    // 		Object.assign(connectionOutput, { totalCount })
    // 		return connectionOutput
    // 	}
    // },
    // transactionsByAccountPublicId: {
    // 	type: TransactionConnection,
    // 	args: {
    // 		accountPublicId: { type: new GraphQLNonNull(GraphQLInt) },
    // 		...connectionArgs
    // 	},
    // 	resolve: async (_, { accountPublicId, ...args }, context) => {
    // 		const account = await Account.findOne({
    // 			publicId: accountPublicId
    // 		})
    // 		if (!account) return
    // 		const transactions = await TransactionLoader.loadByAccountId(account.id)
    // 		return connectionFromArray(transactions, args)
    // 	}
    // }
  })
})
