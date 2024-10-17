import { generateUniqueIntId } from '@/common/generateUniqueIntId'
import { Account } from '@/modules/account/AccountModel'
import { AccountEdge } from '@/modules/account/AccountType'
import { GraphQLNonNull, GraphQLString } from '@/modules/graphql'
import { outputFields } from '@/modules/graphql/outputFields'
import { mutationWithClientMutationId, toGlobalId } from 'graphql-relay'
import { UserLoader } from '../UserLoader'
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
    }
  },
  mutateAndGetPayload: async ({ pixKey, email, fullName }, ctx, info) => {
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
      pixKey,
      email,
      fullName,
      profileImage: 'https://github.com/woovibr.png',
      createdAt: new Date(),
      updatedAt: null
    })
    await user.save()

    const account = new Account({
      publicId: generateUniqueIntId(),
      userId: user._id,
      balance: 100 * 1000,
      status: 'ACTIVE'
    })
    await account.save()

    return {
      success: 'User created successfully',
      error: null,
      user: user.toObject({ getters: true }),
      account: account.toObject({ getters: true })
    }
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
    },
    accountEdge: {
      type: AccountEdge,
      resolve: async ({ account }) => {
        if (!account) return null

        return {
          cursor: toGlobalId('Account', account.id),
          node: account
        }
      }
    }
  })
})
