import type { UserModelDocument } from '@/modules/user/UserModel'

type BucketNames = 'PixKeyQuery'

export const getBucketId = (bucketName: BucketNames, user: UserModelDocument) =>
  `${bucketName}:${user.tenantId}:${user.id}`
