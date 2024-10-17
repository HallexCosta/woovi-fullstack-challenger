import { left } from '@woovi/server-utils'
import type { GraphQLResolveInfo } from 'graphql'
import type { BaseContext } from 'koa'
import type { BucketResponse, ItemRequest } from './bucket'
import { createOrGetBucket } from './createOrGetBucket'

const COST_OF_OPERATION = 1

type MutationFn = (
  input: any,
  ctx: any,
  info: GraphQLResolveInfo
) => Promise<unknown>

export const middlewareMutationBucket: (fn: MutationFn) => MutationFn = (
  fn
) => {
  return async (input, context, info) => {
    // const bucket = createOrGetBucket(context.user.tenantId)
    const bucket = createOrGetBucket('bacen-dict-simulator')

    Object.assign(context, { bucket })

    // draft code to handle if idle timeout
    // bucket.eventEmitter.on('idle', () => {
    // 	const { lastRequestTime, idleTimeout } = bucket.getState()
    // 	if (lastRequestTime) {
    // 		const now = new Date()

    // 		// Check if the time difference has reached the idle timeout
    // 		if (now - lastRequestTime >= idleTimeout) {
    // 			console.log('Idle timeout reached.')
    // 			buckets.delete(context.user.tenantId)
    // 		}
    // 	}
    // })

    try {
      const fnThrottle = async () => left('Too many requests')
      const fnResolver = async ({
        bucket,
        bucketItemRequest
      }: { bucket: BucketResponse; bucketItemRequest: ItemRequest }) =>
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
      return left('Error processing request')
    }
  }
}
