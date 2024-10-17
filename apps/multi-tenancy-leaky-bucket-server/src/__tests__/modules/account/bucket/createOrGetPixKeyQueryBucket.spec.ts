import { createOrGetPixQueryBucket } from '@/modules/account/bucket/createOrGetPixQueryBucket'
import { buckets } from '@/modules/leaky-bucket/buckets'
import { type User, UserModel } from '@/modules/user/UserModel'
import { beforeEach, describe, expect, it } from 'vitest'

describe('createOrGetPixKeyQueryBucket', () => {
  beforeEach(() => buckets.clear())
  it('should be create bucket by tenantId and userId', () => {
    const user1 = new UserModel({
      tenantId: 'tenant-123'
    })
    createOrGetPixQueryBucket(user1)

    expect(buckets.size).toBe(1)
    expect([...buckets.keys()][0]).toBe(`PixKeyQuery:tenant-123:${user1.id}`)
  })
  it('should be ensure that same user can be have multi-buckets in differents tenants', () => {
    const user1 = new UserModel({
      tenantId: 'tenant-123'
    })
    createOrGetPixQueryBucket(user1)

    const user2 = user1.$clone()
    user2.tenantId = 'tenant-321'
    createOrGetPixQueryBucket(user2)

    expect(buckets.size).toBe(2)
    expect(user1.id).toBe(user2.id)
    expect([...buckets.keys()]).toMatchObject([
      `PixKeyQuery:tenant-123:${user1.id}`,
      `PixKeyQuery:tenant-321:${user2.id}`
    ])
  })
  it('should be ensure that same tenant can be have multi-buckets for differents users', () => {
    const user1 = new UserModel({
      tenantId: 'tenant-123'
    })
    createOrGetPixQueryBucket(user1)

    const user2 = new UserModel({
      tenantId: 'tenant-123'
    })
    createOrGetPixQueryBucket(user2)

    expect(buckets.size).toBe(2)
    expect([...buckets.keys()]).toMatchObject([
      `PixKeyQuery:tenant-123:${user1.id}`,
      `PixKeyQuery:tenant-123:${user2.id}`
    ])
  })
  it('should be return null if user dont has any tenantId', () => {
    const expected = createOrGetPixQueryBucket(
      new UserModel({
        email: 'hallex.costa@homtail'
      })
    )
    expect(expected).toBeNull()
  })
  it('should be return null if user dont is instance of UserModel', () => {
    const expected = createOrGetPixQueryBucket({} as User)
    expect(expected).toBeNull()
  })
})
