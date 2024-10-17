import { Account } from '@/modules/account/AccountModel'
import { AccountEdge } from '@/modules/account/AccountType'
import { outputFields } from '@/modules/graphql/outputFields'
import { TenantModel } from '@/modules/tenant/TenantModel'
import { generateUniqueIntId, left, right } from '@woovi/server-utils'
import { GraphQLInt, GraphQLString } from 'graphql'
import { mutationWithClientMutationId, toGlobalId } from 'graphql-relay'
import { UserModel } from '../UserModel'
import { UserEdge } from '../UserType'

export const SignUp = mutationWithClientMutationId({
  name: 'SignUp',
  inputFields: {
    fullName: {
      type: GraphQLString
    },
    email: {
      type: GraphQLString
    },
    pixKey: {
      type: GraphQLString
    },
    tenantPublicId: {
      type: GraphQLInt
    }
  },
  mutateAndGetPayload: async (
    { tenantPublicId, pixKey, email, fullName },
    ctx,
    info
  ) => {
    const tenant = await TenantModel.findOne({
      publicId: tenantPublicId
    })

    if (!tenant) return left('Tenant not found')

    const alreadyUsePixKeyOrEmail = await UserModel.findOne({
      $or: [{ pixKey }, { email }]
    })

    if (alreadyUsePixKeyOrEmail) {
      return {
        error: 'Pix key or email already in use',
        success: null
      }
    }

    const user = new UserModel({
      publicId: generateUniqueIntId(),
      tenantId: tenant.id,
      pixKey,
      email,
      fullName,
      createdAt: new Date(),
      updatedAt: null
    })
    await user.save()

    const account = new Account({
      publicId: generateUniqueIntId(),
      userId: user._id,
      balance: 100 * 1000,
      tenantId: tenant.id,
      status: 'ACTIVE'
    })
    await account.save()

    return right('User created successfully', {
      user: user.toObject({ getters: true })
    })
  },
  outputFields: outputFields({
    userEdge: {
      type: UserEdge,
      resolve: async ({ user }) => {
        if (!user) return null

        return {
          cursor: toGlobalId('User', user.id),
          node: user
        }
      }
    }
  })
})
