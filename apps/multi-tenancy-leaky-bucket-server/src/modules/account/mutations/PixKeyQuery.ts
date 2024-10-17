import { middlewareUserBearerTokenAuthorization } from '@/entrypoint/middlewares/middlewareUserBearerAuthorization'
import { outputFields } from '@/modules/graphql/outputFields'
import { UserEdge } from '@/modules/user/UserType'
import { left, right } from '@woovi/server-utils'
import { GraphQLInt, GraphQLNonNull, GraphQLString } from 'graphql'
import { mutationWithClientMutationId, toGlobalId } from 'graphql-relay'
import { middlewarePixKeyQueryBucket } from '../middlewares/middlewarePixKeyQueryBucket'
import { pixKeyQueryService } from '../services/pixKeyQueryService'

export const PixKeyQuery = mutationWithClientMutationId({
  name: 'PixKeyQuery',
  description: 'Pix key query',
  inputFields: {
    pixKey: {
      type: new GraphQLNonNull(GraphQLString)
    }
  },
  mutateAndGetPayload: middlewareUserBearerTokenAuthorization(
    'mutation',
    middlewarePixKeyQueryBucket(
      async ({ pixKey }, { bucket, bucketItemRequest }, info) => {
        const [data, error] = await pixKeyQueryService(pixKey, { bucket })
        if (error)
          return left(error.message, {
            bucketCapacity: bucket.getState().capacity,
            bucketCurrentCapacity: bucket.getState().currentCapacity
          })

        const { success, ...rightOutput } = data
        console.log({ rightOutput })
        return right(success, {
          ...rightOutput,
          bucketCapacity: bucket.getState().capacity,
          bucketCurrentCapacity: bucket.getState().currentCapacity
        })
      }
    )
  ),
  // mutateAndGetPayload: middlewarePixKeyQueryBucket(
  // 	async ({ pixKey }, { bucket, bucketItemRequest }, info) => {
  // 		const user = await UserLoader.load({
  // 			pixKey
  // 		})
  // 		const bucketCurrentCapacity = bucket.getState().currentCapacity

  // 		const { data, errors } = await bacenProvider.dictKeyCheck(pixKey)

  // 		if (data.BacenPixKeyQuery.error) {
  // 			// const initialCost = bucketItemRequest.cost
  // 			// const pixKeyQueryInvalidCost = 20
  // 			// const finalCost = pixKeyQueryInvalidCost - initialCost
  // 			// bucket.rollbackToken(finalCost)
  // 			console.log('my bucket', bucket.getState())
  // 			return left('The pix key is don´t linked an any people', {
  // 				bucketCurrentCapacity
  // 			})
  // 		}

  // 		const utcHash = `${generateUTCHashId()}`
  // 		const [initalHashUUID, , , , finalHashUUID] = randomUUID().split('-')

  // 		const requestId = `${utcHash}:${initalHashUUID}${finalHashUUID}`
  // 		console.log(bucket.eventEmitter.once)
  // 		bucket.eventEmitter.once(`PIX_OUT:${requestId}`, () => {
  // 			bucket.rollbackToken(1)
  // 			console.log('PixOut Successfully', requestId)
  // 		})

  // 		// control the token use in PixKeyQuery or in CreatePixTransaction using a RollbackTokenMutation
  // 		//bucket.rollbackToken(bucketItemRequest.cost)
  // 		console.log('my bucket', bucket.getState())
  // 		return right('Pix key query successfully', {
  // 			user,
  // 			requestId,
  // 			bucketCurrentCapacity
  // 		})
  // 	}
  // ),
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
    bucketTokensConsumePixKeyInvalid: {
      type: GraphQLInt,
      resolve: () => 20
    },
    bucketCapacity: {
      type: GraphQLInt,
      resolve: ({ bucketCapacity }) => bucketCapacity
    },
    bucketCurrentCapacity: {
      type: GraphQLInt,
      resolve: ({ bucketCurrentCapacity }) => bucketCurrentCapacity
    },
    requestId: {
      type: GraphQLString,
      resolve: ({ requestId }) => requestId
    }
  })
})
