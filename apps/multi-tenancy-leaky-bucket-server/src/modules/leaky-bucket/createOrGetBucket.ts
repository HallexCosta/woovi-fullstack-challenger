import { type BucketInterface, type BucketProps, bucket } from './bucket'
import { buckets } from './buckets'

const BUCKET_CAPACITY = 10 // bucket size (2 requests)
// const LEAK_INTERVAL = 10 // seconds
// const INTERVAL_REFILL = 15 // seconds
const LEAK_INTERVAL = 0.1 // seconds
const INTERVAL_REFILL = 30 // seconds

export const createOrGetBucket = (bucketId: string, options?: BucketProps) => {
  if (!buckets.has(bucketId)) {
    const bucketInitParams = Object.assign(
      {
        capacity: BUCKET_CAPACITY,
        leakInterval: LEAK_INTERVAL,
        refillInterval: INTERVAL_REFILL,
        refillRate: 1
        // idleTimeout: 60 * 60
      },
      options
    )
    buckets.set(bucketId, bucket(bucketInitParams))
  }

  return buckets.get(bucketId) as BucketInterface
}

// export const createOrGetBucket = (tenantId: string) => {
// 	if (!buckets.has(tenantId)) {
// 		const bucket = new LeakyBucket({
// 			capacity: BUCKET_CAPACITY,
// 			interval: INTERVAL_REFILL,
// 			idleTimeout: LEAK_RATE * 1000
// 		})

// 		bucket.on('idleTimeout', () => {
// 			bucket.end()
// 			buckets.delete(tenantId)
// 		})

// 		buckets.set(tenantId, bucket)
// 	}

// 	return buckets.get(tenantId)
// }
