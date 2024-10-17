import { middlewarePixKeyQueryBucket } from '@/modules/account/middlewares/middlewarePixKeyQueryBucket'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  createOrGetPixQueryBucketMock,
  bucketMockWithProcessTrue,
  bucketMockWithProcessFalse,
  requestMock
} = vi.hoisted(() => {
  const fnResolver = vi.fn()
  const fnThrottle = vi.fn()
  const requestMock = {
    fnResolver,
    fnThrottle
  }
  const bucketMockWithProcessTrue = {
    consume: vi.fn().mockReturnValue({ process: true, request: requestMock })
  }
  const bucketMockWithProcessFalse = {
    consume: vi.fn().mockReturnValue({ process: false, request: requestMock })
  }

  const createOrGetPixQueryBucketMock = vi
    .fn()
    .mockReturnValue(bucketMockWithProcessTrue)
  return {
    createOrGetPixQueryBucketMock,
    bucketMockWithProcessTrue,
    bucketMockWithProcessFalse,
    requestMock
  }
})

vi.mock('@/modules/account/bucket/createOrGetPixQueryBucket', async () => {
  const mod = await import('@/modules/account/bucket/createOrGetPixQueryBucket')
  return {
    ...mod,
    createOrGetPixQueryBucket: createOrGetPixQueryBucketMock
  }
})

describe('middlewarePixKeyQueryBucket', () => {
  beforeEach(() => {
    vi.clearAllMocks() // Or you can use vi.resetAllMocks() if need reset the mocks by complety
  })

  it('should be return a function that receive params input, context and info from Mutation request and apply my bucket rules processing the fnResolver', async () => {
    createOrGetPixQueryBucketMock.mockReturnValueOnce(bucketMockWithProcessTrue)
    const fn = middlewarePixKeyQueryBucket(requestMock.fnResolver)
    expect(fn).toStrictEqual(expect.any(Function))

    const input = {}
    const context = {
      user: {
        id: 'xyz',
        tenantId: 'xyz'
      }
    }
    const info = {}
    await fn(input, context, info)

    expect(createOrGetPixQueryBucketMock).toBeCalledWith(context.user)

    expect(requestMock.fnThrottle).not.toBeCalled()
    expect(requestMock.fnResolver).toBeCalledWith({
      bucket: bucketMockWithProcessTrue,
      bucketItemRequest: requestMock
    })
  })

  it('should be return a function that receive params input, context and info from Mutation request and apply my bucket rules processing the fnThrottle', async () => {
    createOrGetPixQueryBucketMock.mockReturnValueOnce(
      bucketMockWithProcessFalse
    )

    const fn = middlewarePixKeyQueryBucket(requestMock.fnResolver)
    expect(fn).toStrictEqual(expect.any(Function))

    const input = {}
    const context = {
      user: {
        id: 'xyz',
        tenantId: 'xyz'
      }
    }
    const info = {}
    await fn(input, context, info)

    expect(createOrGetPixQueryBucketMock).toBeCalledWith(context.user)

    expect(requestMock.fnThrottle).toBeCalled()
    expect(requestMock.fnResolver).not.toBeCalled()
  })
})
