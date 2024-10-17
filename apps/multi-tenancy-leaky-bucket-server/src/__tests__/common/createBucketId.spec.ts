import { createBucketId } from '@/common/createBucketId'
import { describe, expect, it } from 'vitest'

describe('createBucketId', () => {
  it('should be receive an user and create bucketId by tenantId and userId', () => {
    expect(createBucketId('MyBucket', 'tenant-123', 'user-123')).toBe(
      'MyBucket:tenant-123:user-123'
    )
  })
  it('should be return null if tenantId or userId is null', () => {
    expect(
      createBucketId('MyBucket', null as unknown as string, 'user-123')
    ).toBeNull()

    expect(
      createBucketId('MyBucket', 'tenant-123', null as unknown as string)
    ).toBeNull()
  })
})
