import { bucket } from '@/modules/leaky-bucket/bucket'
import { describe, expect, it, vi } from 'vitest'

describe('bucket', () => {
  it('should be create the diffent instances from bucket', () => {
    const myBucket = bucket({
      capacity: 10,
      refillRate: 5,
      refillInterval: 1,
      leakInterval: 1
    })
    const myBucket2 = bucket({
      capacity: 11,
      refillRate: 5,
      refillInterval: 1,
      leakInterval: 1
    })
    expect(myBucket.getState()).not.toMatchObject(myBucket2.getState())
  })
  describe('getState', () => {
    it('should be create bucket with capacity, refillRate, refillInterval and leakInterval', () => {
      const myBucket = bucket({
        capacity: 10,
        refillRate: 5,
        refillInterval: 1,
        leakInterval: 1
      })
      expect(myBucket.getState()).toMatchObject({
        capacity: 10,
        currentCapacity: 10,
        refillRate: 5,
        refillInterval: 1 * 1000,
        leakInterval: 1 * 1000
      })
    })
  })
  describe('consume', () => {
    it('should be consume "tokens" from bucket', async () => {
      const myBucket = bucket({
        capacity: 10,
        refillRate: 0,
        refillInterval: 10,
        leakInterval: 1
      })

      const fnThrottle = vi.fn()
      const fnResolver = vi.fn()
      const { process, request } = await myBucket.consume(
        1,
        fnResolver,
        fnThrottle
      )

      expect(process).toBeTruthy()
      expect(request.currentCapacity).toBe(9)
      expect(myBucket.getState().currentCapacity).toBe(9)
    })
    it('should be allow processing the max bucket capacity in parallel', async () => {
      const myBucket = bucket({
        capacity: 10,
        refillRate: 1,
        refillInterval: 10,
        leakInterval: 0
      })

      const fnThrottle = vi.fn()
      const fnResolver = vi.fn()
      const costOfOperation = 1
      const tasks = Array.from({ length: 12 }, () =>
        myBucket.consume(costOfOperation, fnResolver, fnThrottle)
      )
      const results = await Promise.allSettled(tasks)
      expect(
        results.filter((result) => result.value.process).length
      ).toStrictEqual(10)
      expect(
        results.filter((result) => !result.value.process).length
      ).toStrictEqual(2)
    })
  })
  describe('rollbackToken', async () => {
    it('should be refill token after remove a token from bucket', async () => {
      const myBucket = bucket({
        capacity: 10,
        refillRate: 1,
        refillInterval: 10,
        leakInterval: 0
      })

      const fnThrottle = vi.fn()
      const fnResolver = vi.fn()
      const costOfOperation = 1
      await myBucket.consume(costOfOperation, fnResolver, fnThrottle)
      expect(myBucket.getState().currentCapacity).toBe(9)
      myBucket.rollbackToken(1)
      expect(myBucket.getState().currentCapacity).toBe(10)
    })
    it('should be not allow execed the bucket capacity', async () => {
      const myBucket = bucket({
        capacity: 10,
        refillRate: 1,
        refillInterval: 10,
        leakInterval: 0
      })

      myBucket.rollbackToken(5)
      expect(myBucket.getState().currentCapacity).not.toBe(15)
      expect(myBucket.getState().currentCapacity).toBe(10)
    })
    it('should be set capacity with zero value if cost is more than capacity', () => {
      const myBucket = bucket({
        capacity: 10,
        refillRate: 1,
        refillInterval: 10,
        leakInterval: 0
      })

      myBucket.rollbackToken(-10)
      expect(myBucket.getState().currentCapacity).not.toBe(10)
      expect(myBucket.getState().currentCapacity < 0).not.toBeTruthy()
      expect(myBucket.getState().currentCapacity).toBe(0)
    })
  })
  describe('refillBucket', () => {
    it('should be refill the bucket within the interval defined', async () => {
      vi.useFakeTimers()

      const fakeDate = new Date(2002, 6, 16, 9, 30, 0)
      vi.setSystemTime(fakeDate)

      const myBucket = bucket({
        capacity: 1,
        refillRate: 1,
        refillInterval: 10,
        leakInterval: 0
      })

      const fnThrottle = vi.fn()
      const fnResolver = vi.fn()
      const costOfOperation = 1
      const { process, request } = await myBucket.consume(
        costOfOperation,
        fnResolver,
        fnThrottle
      )

      expect(process).toBeTruthy()
      expect(request.fnResolver).not.toBeNull()
      expect(myBucket.getState().lastRefillTime).toBe(+fakeDate)

      const tenSeconds = 10 * 1000
      vi.advanceTimersByTime(tenSeconds)

      const { process: process2, request: request2 } = await myBucket.consume(
        costOfOperation,
        fnResolver,
        fnThrottle
      )

      expect(process2).toBeTruthy()
      expect(request2.fnResolver).not.toBeNull()
      expect(myBucket.getState().lastRefillTime).toBe(+fakeDate + tenSeconds)
    })
  })
})
