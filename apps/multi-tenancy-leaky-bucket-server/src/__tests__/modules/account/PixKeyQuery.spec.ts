import { createToken } from '@/__tests__/setup/fixtures/createToken'
import { makePixKeyQueryMutationRequest } from '@/__tests__/setup/makes/makePixKeyQueryMutationRequest'
import { gql } from '@/__tests__/setup/utils/gql'
import { main } from '@/main'
import { buckets } from '@/modules/leaky-bucket/buckets'
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi
} from 'vitest'

const { bacenProviderMock } = vi.hoisted(() => {
  const bacenProviderMock = {
    dictKeyCheck: vi.fn().mockResolvedValue({
      data: {
        BacenPixKeyQuery: {
          error: null,
          success: 'Pix key query successfully',
          e2eid: 'E290202410050406yTHHLXDvOvV',
          accountEdge: {
            node: { id: 'YWNjb3VudDphY2NvdW50OjE=', publicId: 18110739 }
          }
        }
      }
    })
  }

  return {
    bacenProviderMock
  }
})

vi.mock('@/modules/account/providers/bacenProvider', async () => {
  const mod = await import('@/modules/account/providers/bacenProvider')
  return {
    ...mod,
    bacenProvider: bacenProviderMock
  }
})

vi.mock('node:events', async () => {
  const mod = await import('node:events')

  const EventEmitterMock = vi.fn()
  EventEmitterMock.prototype.once = vi.fn()

  return {
    ...mod,
    EventEmitter: EventEmitterMock
  }
})

describe('PixKeyQuery', () => {
  beforeAll(() => {
    vi.clearAllMocks()
  })
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })
  describe('general', () => {
    it('should be make pix key query and return the user account', async () => {
      const { token } = await createToken()

      const app = await main()
      const { data } = await makePixKeyQueryMutationRequest(app, token)

      const { PixKeyQuery } = data

      expect(PixKeyQuery.success).not.toBeNull()
      expect(PixKeyQuery.requestId).not.toBeNull()
    })
  })

  it('should be set event in bucket using the pixKeyQueryRequestId', async () => {
    const { token, tenant, user } = await createToken()

    const app = await main()
    const { data, errors } = await makePixKeyQueryMutationRequest(app, token)
    const { PixKeyQuery } = data

    expect(PixKeyQuery.success).not.toBeNull()
    expect(PixKeyQuery.requestId).not.toBeNull()

    const bucket = buckets.get(`PixKeyQuery:${tenant.id}:${user.id}`)
    const eventId = `PIX_OUT:${PixKeyQuery.requestId}`
    expect(bucket?.eventEmitter.once).toBeCalledWith(
      eventId,
      expect.any(Function)
    )
  })

  describe('consume token', () => {
    it('should be consume 1 token per PixKeyQuery request (bucket starts with 10 tokens)', async () => {
      const { token } = await createToken()

      const app = await main()
      const {
        data: { PixKeyQuery }
      } = await makePixKeyQueryMutationRequest(app, token)

      expect(PixKeyQuery.bucketCurrentCapacity).toBe(9)
    })
    it('should be allow procecss only 10 requests, the request of number 11 should be drop', async () => {
      const fakeDate = new Date(2002, 6, 16, 9, 30, 0)
      vi.setSystemTime(fakeDate)

      const { token } = await createToken()

      const app = await main()
      const requests = Array.from({ length: 11 }).map(() =>
        makePixKeyQueryMutationRequest(app, token)
      )
      const resolveds = await Promise.allSettled(requests)
      const allStatus = resolveds.map((resolved) => resolved.status)
      const successMessages = resolveds
        .map((resolved) => resolved.value.data.PixKeyQuery.success)
        .filter(Boolean)
      const errorMessages = resolveds
        .map((resolved) => resolved.value.data.PixKeyQuery.error)
        .filter(Boolean)
      console.log({ successMessages, errorMessages })
      expect(allStatus.every((status) => status === 'fulfilled')).toBeTruthy()
      expect(
        successMessages.every(
          (success) => success === 'Pix key query successfully'
        )
      ).toBeTruthy()
      expect(successMessages.length).toBe(10)
      expect(errorMessages.length).toBe(1)
    })
    // it.todo(
    // 	'should be refill with 1 token if PixKeyQuery was converted in PixTransaction'
    // )
    it('should be consume 1 tokens if pixKey not found', async () => {
      const spy = vi.spyOn(bacenProviderMock, 'dictKeyCheck').mockReturnValue({
        data: {
          BacenPixKeyQuery: {
            error: 'Pix key not found',
            success: null,
            e2eid: 'E290202410050406yTHHLXDvOvV',
            accountEdge: null
          }
        }
      })

      const { token } = await createToken()

      const app = await main()
      const {
        data: { PixKeyQuery }
      } = await makePixKeyQueryMutationRequest(app, token)

      expect(PixKeyQuery.error).not.toBeNull()
      expect(PixKeyQuery.success).toBeNull()
      expect(spy).toBeCalled()
    })
    it('should be consume the token from the current user bucket belongs from tenant', async () => {
      const {
        token: token1,
        user: user1,
        tenant: tenant1
      } = await createToken()
      const {
        token: token2,
        user: user2,
        tenant: tenant2
      } = await createToken()

      const app = await main()

      // called twice for user 1
      await makePixKeyQueryMutationRequest(app, token1)
      await makePixKeyQueryMutationRequest(app, token1)

      // called once for user 2
      await makePixKeyQueryMutationRequest(app, token2)

      // const bucketId1 = createBucketId('PixKeyQuery', tenant1.id, user1.id)
      // const bucketId2 = createBucketId('PixKeyQuery', tenant2.id, user2.id)

      const bucketId1 = `PixKeyQuery:${tenant1.id}:${user1.id}`
      const bucketId2 = `PixKeyQuery:${tenant2.id}:${user2.id}`

      const bucket1 = buckets.get(bucketId1 as string)
      const bucket2 = buckets.get(bucketId2 as string)

      expect(bucketId1).not.toBeNull()

      expect(bucket1?.getState().currentCapacity).toBe(8)
      expect(bucket2?.getState().currentCapacity).toBe(9)
    })
  })

  it('should be refill the bucket each at 1 hour at 1 token', async () => {
    const fakeDate = Date.UTC(2002, 6, 16, 9, 0, 0)
    vi.useFakeTimers()
    vi.setSystemTime(fakeDate)

    const { token: token1, user: user1, tenant: tenant1 } = await createToken()

    const app = await main()

    await makePixKeyQueryMutationRequest(app, token1)
    const bucketId1 = `PixKeyQuery:${tenant1.id}:${user1.id}`
    const bucket1 = buckets.get(bucketId1)
    expect(bucket1?.getState().currentCapacity).toBe(9)

    const thirtyMinutes = 1 * 30 * (60 * 1000)
    vi.advanceTimersByTime(thirtyMinutes)
    await makePixKeyQueryMutationRequest(app, token1)
    const bucket1AfterThirtyMinutes = buckets.get(bucketId1 as string)
    expect(bucket1AfterThirtyMinutes?.getState().currentCapacity).toBe(8)

    vi.advanceTimersByTime(thirtyMinutes)
    await makePixKeyQueryMutationRequest(app, token1)

    const bucket1AfterRefillTime = buckets.get(bucketId1 as string)
    expect(bucket1AfterRefillTime?.getState().currentCapacity).toBe(8)
  })
})
