import { randomUUID } from 'node:crypto'
import { left, right } from '@/common/either'
import { generateUTCHashId } from '@/common/generateUTCHashId'
import type {
  BucketInterface,
  ItemRequest
} from '@/modules/leaky-bucket/bucket'
import { UserLoader } from '@/modules/user/UserLoader'
import type { UserModelDocument } from '@/modules/user/UserModel'
import { bacenProvider } from '../providers/bacenProvider'

type PixKeyQueryServiceDependencies = {
  bucket: BucketInterface
  bucketItemRequest?: ItemRequest
}

export const pixKeyQueryService = async (
  pixKey: string,
  { bucket }: PixKeyQueryServiceDependencies
) => {
  const { data, errors } = await bacenProvider.dictKeyCheck(pixKey)

  if (data.BacenPixKeyQuery.error) {
    return left(data.BacenPixKeyQuery.error)
  }

  const utcHash = `${generateUTCHashId()}`
  const [initalHashUUID, , , , finalHashUUID] = randomUUID().split('-')

  const requestId = `${utcHash}:${initalHashUUID}${finalHashUUID}`
  bucket.eventEmitter.once(
    `PIX_OUT:${requestId}`,
    ({ destinationPixKey, originPixKey }) => {
      bucket.rollbackToken(1)
      console.log('e2eid', requestId)
      console.log(
        'PixOut Successfully',
        'from',
        originPixKey,
        'to',
        destinationPixKey
      )
    }
  )

  // go back the token if success in query
  // bucket.rollbackToken(-1)
  return right({
    success: 'Pix key query successfully',
    user: data.BacenPixKeyQuery.accountEdge.node,
    requestId,
    bucketCurrentCapacity: bucket.getState().currentCapacity
  })
}
