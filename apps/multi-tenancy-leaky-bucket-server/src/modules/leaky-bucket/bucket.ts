import { EventEmitter } from 'node:events'
import { createPromiseWithResolvers } from '@/common/createPromiseWithResolvers'
import { getBucketState } from './core/getBucketState'

type FnResolver = ({
  bucket,
  bucketItemRequest
}: {
  bucket: BucketInterface
  bucketItemRequest: ItemRequest
}) => Promise<unknown>

type FnThrottle = () => Promise<unknown>

type UpdatedCapacityAndUpdatedLastRefillReturn = {
  updatedCapacity: number
  updatedLastRefill?: number
}

type UpdateCapacityAndLastRefill = (
  capacity: number,
  lastRefillTime?: number
) => UpdatedCapacityAndUpdatedLastRefillReturn

type FnRefillBucket = (
  lastRefillTime: number,
  refillInterval: number,
  refillRate: number,
  currentCapacity: number,
  capacity: number
) => Promise<unknown>

export type ItemRequest = {
  promise: Promise<unknown>
  resolve: (value: unknown) => void
  reject: (value?: unknown) => void
  currentCapacity: number
  cost: number
  fnResolver: FnResolver
  fnThrottle: FnThrottle
}

export type BucketProps = {
  capacity: number
  leakInterval?: number | null
  refillInterval: number
  refillRate: number
  idleTimeout?: number
}

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

type ConsumeBucketProps = {
  cost: number
  totalCost: number
  lastRefillTime: number
  refillInterval: number
  refillRate: number
  currentCapacity: number
  capacity: number
  lastRequestTime: number | null
  timeoutId: number | null
  updateCapacityAndLastRefill: UpdateCapacityAndLastRefill
  updateTotalCost: (cost: number) => number
  updateLastRequestTime: () => void
  addRequestToQueue: BucketAddRequestToQueue
  fnResolver: FnResolver
  fnThrottle: FnThrottle
}

export type BucketInterface = {
  consume: (
    cost: number,
    fnResolver: FnResolver,
    fnThrottle: FnThrottle
  ) => Promise<{ process: boolean; request: ItemRequest }>
  getState: () => BucketState
  rollbackToken: (cost: number) => void
  eventEmitter: EventEmitter
}

type BucketStartLeakProps = {
  updateProcessRunning: (state: boolean) => boolean
  getQueue: () => ItemRequest[]
  currentCapacity: number
  leakInterval: number
  updateCapacityAndLastRefill: UpdateCapacityAndLastRefill
  updateTotalCost: (cost: number) => number
  refillBucket?: FnRefillBucket
  getFirstRequestFromQueue: () => ItemRequest
  shiftFirstRequestFromQueue: () => void
}

type BucketAddRequestToQueue = (request: ItemRequest) => void

// refill bucket by interval of rate charges
export const refillBucket = (
  lastRefillTime: number,
  refillInterval: number,
  refillRate: number,
  currentCapacity: number,
  capacity: number
): UpdatedCapacityAndUpdatedLastRefillReturn => {
  const now = Date.now()
  const elapsed = now - lastRefillTime

  if (elapsed >= refillInterval) {
    const refillAmount = Math.floor(elapsed / refillInterval) * refillRate
    const updatedCapacity = Math.min(currentCapacity + refillAmount, capacity)
    return {
      updatedCapacity,
      updatedLastRefill: now
    }
  }

  return { updatedCapacity: currentCapacity, updatedLastRefill: lastRefillTime }
}

const consumeBucket = ({
  cost,
  totalCost,
  currentCapacity,
  capacity,
  fnResolver,
  fnThrottle,
  updateTotalCost,
  addRequestToQueue
}: ConsumeBucketProps): ItemRequest | null => {
  if (!currentCapacity) {
    return null
  }

  if (totalCost + cost > capacity) {
    return null
  }

  const { promise, resolve, reject } = createPromiseWithResolvers()
  const item: ItemRequest = {
    promise,
    resolve,
    reject,
    currentCapacity,
    cost,
    fnResolver,
    fnThrottle
  }

  updateTotalCost(+item.cost)
  addRequestToQueue(item)

  return item
}
const processQueue = async ({
  currentCapacity,
  leakInterval,
  updateCapacityAndLastRefill,
  updateTotalCost,
  refillBucket,
  getFirstRequestFromQueue,
  shiftFirstRequestFromQueue,
  getQueue,
  updateProcessRunning
}: BucketStartLeakProps) => {
  const queue = getQueue()
  const item = getFirstRequestFromQueue()

  if (leakInterval) {
    await new Promise((resolve) => setTimeout(resolve, leakInterval))
  }

  if (currentCapacity >= item.cost) {
    const updatedCapacity = currentCapacity - item.cost
    updateCapacityAndLastRefill(updatedCapacity)
    updateTotalCost(-item.cost)
    shiftFirstRequestFromQueue()

    const request = {
      ...item,
      oldCurrentCapacity: item.currentCapacity,
      currentCapacity: updatedCapacity
    }
    Object.freeze(request)
    item.resolve({
      process: true,
      request
    })

    if (queue.length > 0) {
      await processQueue({
        currentCapacity: updatedCapacity,
        leakInterval,
        updateCapacityAndLastRefill,
        updateTotalCost,
        refillBucket,
        getFirstRequestFromQueue,
        shiftFirstRequestFromQueue,
        getQueue,
        updateProcessRunning
      })
    } else {
      updateProcessRunning(false)
    }
  } else {
    const request = item
    Object.freeze(request)
    item.resolve({ process: false, request })
    shiftFirstRequestFromQueue()

    if (queue.length > 0) {
      await processQueue({
        currentCapacity,
        leakInterval,
        updateCapacityAndLastRefill,
        updateTotalCost,
        refillBucket,
        getFirstRequestFromQueue,
        shiftFirstRequestFromQueue,
        getQueue,
        updateProcessRunning
      })
    } else {
      updateProcessRunning(false)
    }
  }
}

export const startLeak = async ({
  currentCapacity,
  getQueue,
  leakInterval,
  updateCapacityAndLastRefill,
  updateTotalCost,
  refillBucket,
  getFirstRequestFromQueue,
  shiftFirstRequestFromQueue,
  updateProcessRunning
}: BucketStartLeakProps) => {
  updateProcessRunning(true)

  const item = getFirstRequestFromQueue()

  if (!item) return

  processQueue({
    currentCapacity,
    leakInterval,
    updateCapacityAndLastRefill,
    updateTotalCost,
    refillBucket,
    getFirstRequestFromQueue,
    shiftFirstRequestFromQueue,
    getQueue,
    updateProcessRunning
  })

  return item
}

export const bucket = ({
  capacity,
  refillInterval,
  leakInterval,
  refillRate,
  idleTimeout
}: BucketProps): BucketInterface => {
  const eventEmitter = new EventEmitter()
  const queue: ItemRequest[] = []

  refillInterval = refillInterval * 1000
  leakInterval = leakInterval ? leakInterval * 1000 : 0

  let totalCost = 0
  let lastRequestTime: number | null = null
  const lifetime = Date.now()
  let currentCapacity = capacity
  let lastRefillTime = Date.now()
  const timeoutId = null
  let processRunning = false

  const updateProcessRunning = (state: boolean) => {
    processRunning = state
    return processRunning
  }

  const updateLastRequestTime = () => {
    lastRequestTime = Date.now()
  }

  const updateTotalCost = (cost: number) => {
    totalCost += cost
    return totalCost
  }

  const rollbackToken = (cost: number) => {
    // set zero the currentCapacity if the rollbackToken is used to decrease more tokens that the currentCapacity support
    if (cost < 0) {
      if (Math.abs(cost) > currentCapacity) {
        currentCapacity = 0
        return
      }
    }

    currentCapacity = Math.min(capacity, Math.max(0, currentCapacity + cost))
  }

  const addRequestToQueue: BucketAddRequestToQueue = (request: ItemRequest) => {
    queue.push(request)
  }

  const getQueue = () => queue
  const getFirstRequestFromQueue = () => queue[0]
  const shiftFirstRequestFromQueue = () => queue.shift()

  const updateCapacityAndLastRefill = (
    updatedCapacity: number,
    updatedLastRefill?: number
  ) => {
    currentCapacity = updatedCapacity
    lastRefillTime = updatedLastRefill ?? lastRefillTime
    return {
      updatedCapacity: currentCapacity,
      updatedLastRefill: lastRefillTime
    }
  }

  const consume = async (
    cost: number,
    fnResolver: FnResolver,
    fnThrottle: FnThrottle
  ) => {
    const reuseConsumeBucket = () =>
      consumeBucket({
        cost,
        totalCost,
        lastRefillTime,
        refillInterval,
        refillRate,
        currentCapacity,
        capacity,
        lastRequestTime,
        timeoutId,
        updateTotalCost,
        updateLastRequestTime,
        fnResolver,
        fnThrottle,
        addRequestToQueue,
        updateCapacityAndLastRefill
      })

    let request = reuseConsumeBucket()

    // last attempt or drop request
    if (!request) {
      const { updatedCapacity, updatedLastRefill } = refillBucket(
        lastRefillTime,
        refillInterval,
        refillRate,
        currentCapacity,
        capacity
      )

      // refill bucket
      updateCapacityAndLastRefill(updatedCapacity, updatedLastRefill)

      if (totalCost === capacity || !currentCapacity) {
        return {
          process: false,
          request: {
            fnResolver: null,
            fnThrottle
          }
        }
      }

      // if enough space in bucket "retry"
      request = reuseConsumeBucket() as ItemRequest
    }

    const { updatedCapacity, updatedLastRefill } = refillBucket(
      lastRefillTime,
      refillInterval,
      refillRate,
      currentCapacity,
      capacity
    )

    // refill bucket
    updateCapacityAndLastRefill(updatedCapacity, updatedLastRefill)

    // Start the leak process to run the request
    if (!processRunning) {
      startLeak({
        currentCapacity,
        leakInterval,
        updateCapacityAndLastRefill,
        getQueue,
        updateTotalCost,
        getFirstRequestFromQueue,
        shiftFirstRequestFromQueue,
        updateProcessRunning
      })
    }

    return request.promise
  }

  const getState = () =>
    getBucketState({
      lifetime,
      lastRequestTime,
      currentCapacity,
      leakInterval,
      refillInterval,
      refillRate,
      capacity,
      lastRefillTime,
      idleTimeout
    })

  return {
    consume,
    getState,
    eventEmitter,
    rollbackToken
  }
}
