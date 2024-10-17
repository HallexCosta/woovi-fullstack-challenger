import { isLeft } from '@/common/either'
import { outputFields } from '@/modules/graphql/outputFields'
import { left, right } from '@woovi/server-utils'
import { GraphQLNonNull, GraphQLString } from 'graphql'
import { mutationWithClientMutationId, toGlobalId } from 'graphql-relay'
import { BacenAccountEdge } from '../BacenAccountType'
import { middlewareBacenPixKeyQueryBucket } from '../middlewares/middlewareBacenPixKeyQueryBucket'
import { bacenPixKeyQueryService } from '../services/bacenPixKeyQueryService'

// simulate PixKeyQuery from bacen simulator using graphql
export const BacenPixKeyQuery = mutationWithClientMutationId({
  name: 'BacenPixKeyQuery',
  description: 'Bacen Pix key query',
  inputFields: {
    key: {
      type: new GraphQLNonNull(GraphQLString)
    }
  },
  mutateAndGetPayload: middlewareBacenPixKeyQueryBucket(
    async ({ key }, { bucket, bucketItemRequest }, info) => {
      const [data, error] = bacenPixKeyQueryService(key, {
        bucket,
        bucketItemRequest
      })

      if (error) {
        return left(error.message)
      }

      const { success, ...output } = data
      return right(data.success, output)
    }
  ),
  outputFields: outputFields({
    accountEdge: {
      type: BacenAccountEdge,
      resolve: ({ account }) => {
        if (!account) return null

        return {
          cursor: toGlobalId('BacenAccount', account.id),
          node: account
        }
      }
    },
    e2eid: {
      type: GraphQLString,
      resolve: ({ e2eid }) => e2eid
    }
  })
})
