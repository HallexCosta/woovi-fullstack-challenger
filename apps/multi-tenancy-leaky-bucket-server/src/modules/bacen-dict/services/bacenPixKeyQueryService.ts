// import { left, right } from '@woovi/server-utils'
import { left, right } from '@/common/either'
import { generateEndToEndId } from '@/modules/bacen-dict/common/generateEnd2EndId'
import { bacen } from '@/modules/bacen-dict/database/bacen'
import type {
  BucketInterface,
  ItemRequest
} from '@/modules/leaky-bucket/bucket'

const validPixKeys = [
  'hallex.costa@hotmail.com',
  'hallex.costa1@hotmail.com',
  'hallex.costa2@hotmail.com',
  'validpixkey@hotmail.com',
  'valid-pix-key'
]

export const bacenPixKeyQueryService = (
  key: string,
  {
    bucket,
    bucketItemRequest
  }: { bucket: BucketInterface; bucketItemRequest?: ItemRequest }
) => {
  if (!bucketItemRequest) {
    bucket.rollbackToken(-1)
  }

  const e2eid = generateEndToEndId()

  if (!validPixKeys.includes(key)) {
    const pixKeyInvalidCost = 20
    // the bcketItemRequest is passed when BacenPixKeyQueryMutation is called
    // the else is called while pixKeyQueryService is called together BacenCreatePixTransaction
    // but not is passed a e2eid
    if (bucketItemRequest) {
      const initialCost = bucketItemRequest.cost
      const finalOperationCost = pixKeyInvalidCost - initialCost
      bucket.rollbackToken(-finalOperationCost)
    } else {
      bucket.rollbackToken(-pixKeyInvalidCost)
    }

    console.log('bacen', bucket.getState())
    return left('Invalid pix key')
  }

  const eventId = `PIX_OUT:${e2eid}`

  // if necessary expire the pix out id event
  // const timeoutIdExpirePixOutEvent = setTimeout(() => {
  // 	bucket.eventEmitter.removeAllListeners([eventId])
  // }, 20 * 1000)

  // prepare rollback token while awaiting the pix out
  bucket.eventEmitter.once(eventId, () => {
    if (bucketItemRequest) {
      bucket.rollbackToken(bucketItemRequest.cost)
    } else {
      bucket.rollbackToken(1)
    }

    console.log(
      'Pix Out make with successfully, rollback 1 token to the bucket'
    )
    console.log('bacen', bucket.getState())
    // clearTimeout(timeoutIdExpirePixOutEvent)
  })

  console.log('bacen', bucket.getState())
  return right({
    success: 'Pix key query successfully',
    account: bacen.get('accounts')?.get('account:1'),
    e2eid
  })
}
