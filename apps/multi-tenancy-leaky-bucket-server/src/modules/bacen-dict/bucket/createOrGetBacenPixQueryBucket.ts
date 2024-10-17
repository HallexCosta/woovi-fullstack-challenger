import { createOrGetBucket } from '@/modules/leaky-bucket/createOrGetBucket'

const BUCKET_CAPACITY = 70 // bucket size (2 requests)
const LEAK_INTERVAL = 0 // seconds
const INTERVAL_REFILL = 60 // seconds
const REFILL_RATE = BUCKET_CAPACITY

export const bacenPixKeyQueryBucketId = 'BacenPixKeyQuery:participantId:userId'

export const createOrGetBacenPixQueryBucket = () => {
  return createOrGetBucket(bacenPixKeyQueryBucketId, {
    capacity: BUCKET_CAPACITY,
    leakInterval: LEAK_INTERVAL,
    refillInterval: INTERVAL_REFILL,
    refillRate: REFILL_RATE
    // idleTimeout: 60 * 60
  })
}
