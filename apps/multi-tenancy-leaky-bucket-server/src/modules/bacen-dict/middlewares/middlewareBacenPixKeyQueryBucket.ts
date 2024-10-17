import { createOrGetBacenPixQueryBucket } from '@/modules/bacen-dict/bucket/createOrGetBacenPixQueryBucket'
import type {
  BucketInterface,
  ItemRequest
} from '@/modules/leaky-bucket/bucket'
import { left } from '@woovi/server-utils'
import type { GraphQLResolveInfo } from 'graphql'

const COST_OF_OPERATION = 1

type MutationFn = (
  input: any,
  ctx: any,
  info: GraphQLResolveInfo
) => Promise<unknown>

export const middlewareBacenPixKeyQueryBucket: (fn: MutationFn) => MutationFn =
  (fn) => {
    return async (input, context, info) => {
      const bucket = createOrGetBacenPixQueryBucket()

      Object.assign(context, { bucket })

      try {
        const fnThrottle = async () => left('Too many requests')
        const fnResolver = async ({
          bucket,
          bucketItemRequest
        }: { bucket: BucketInterface; bucketItemRequest: ItemRequest }) =>
          await fn(input, { ...context, bucket, bucketItemRequest }, info)

        const { process, request } = await bucket.consume(
          COST_OF_OPERATION,
          fnResolver,
          fnThrottle
        )

        if (!process) {
          return await request.fnThrottle()
        }

        return await request.fnResolver({ bucket, bucketItemRequest: request })
      } catch (error) {
        console.error('Failed to consume token:', error)
        return left('Error processing request in queue')
      }
    }
  }
