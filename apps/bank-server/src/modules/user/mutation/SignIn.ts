import { GraphQLNonNull, GraphQLString } from '@/modules/graphql'
import { mutationWithClientMutationId, toGlobalId } from 'graphql-relay'
import { UserEdge } from '../UserType'

import { outputFields } from '@/modules/graphql/outputFields'
import { signInService } from '../services/signInService'

export const SignIn = mutationWithClientMutationId({
  name: 'SignIn',
  inputFields: {
    email: {
      type: new GraphQLNonNull(GraphQLString)
    }
  },
  mutateAndGetPayload: async ({ email }) => {
    return await signInService(email)
  },
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
