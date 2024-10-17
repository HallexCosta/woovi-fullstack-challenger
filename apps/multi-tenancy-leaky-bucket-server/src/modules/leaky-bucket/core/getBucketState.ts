type BucketState = {
  idleTimeout?: number
  lifetime?: number
  currentCapacity: number
  capacity: number
  leakInterval: number
  refillInterval: number
  refillRate: number
  lastRefillTime: number
  lastRequestTime: number | null
}

export const getBucketState = (bucketState: BucketState) => bucketState
