import {
  GraphQLError,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLString
} from 'graphql'
import { mutationWithClientMutationId, toGlobalId } from 'graphql-relay'
import { UserEdge } from '../UserType'

import { outputFields } from '@/modules/graphql/outputFields'
import { signInService } from '../services/signInService'

export const SignIn = mutationWithClientMutationId({
  name: 'SignIn',
  inputFields: {
    tenantPublicId: {
      type: new GraphQLNonNull(GraphQLInt)
    },
    email: {
      type: new GraphQLNonNull(GraphQLString)
    }
  },
  mutateAndGetPayload: async ({ tenantPublicId, email }, context, info) => {
    const response = await signInService(tenantPublicId, email)

    return response
  },
  extensions: {},
  outputFields: outputFields({
    userEdge: {
      type: UserEdge,
      resolve: ({ user }) => {
        if (!user) return null

        return {
          cursor: toGlobalId('User', user.id),
          node: user
        }
      }
    },
    token: {
      type: GraphQLString,
      resolve: ({ token }) => token
    }
  })
})
