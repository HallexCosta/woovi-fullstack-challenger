export const createBucketId = (
  bucketName: string,
  tenantId: string,
  userId: string
) => {
  if (!tenantId || !userId) return null

  return `${bucketName}:${tenantId}:${userId}`
}
