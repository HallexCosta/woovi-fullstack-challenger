import { createBucketId } from '@/common/createBucketId'
import { createOrGetBucket } from '@/modules/leaky-bucket/createOrGetBucket'
import { type User, UserModel } from '@/modules/user/UserModel'

const BUCKET_CAPACITY = 10 // bucket size (10 requests)
const LEAK_INTERVAL = 0 // seconds
const INTERVAL_REFILL = 60 * 60 // in seconds - 60 * 60 = 1 hour
const REFILL_RATE = 1

const createPixKeyQueryBucketId = (tenantId: string, userId: string) =>
  createBucketId('PixKeyQuery', tenantId, userId)

export const createOrGetPixQueryBucket = (user: User) => {
  if (!(user instanceof UserModel)) return null

  const bucketId = createPixKeyQueryBucketId(user.tenantId, user.id)

  if (!bucketId) return null

  return createOrGetBucket(bucketId, {
    capacity: BUCKET_CAPACITY,
    leakInterval: LEAK_INTERVAL,
    refillInterval: INTERVAL_REFILL,
    refillRate: REFILL_RATE
    // idleTimeout: 60 * 60
  })
}
