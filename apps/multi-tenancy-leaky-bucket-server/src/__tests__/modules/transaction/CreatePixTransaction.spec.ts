import EventEmitter from 'node:events'
import { createToken } from '@/__tests__/setup/fixtures/createToken'
import { makeCreatePixTransactionMutationRequest } from '@/__tests__/setup/makes/makeCreatePixTransactionMutationRequest'
import { makePixKeyQueryMutationRequest } from '@/__tests__/setup/makes/makePixKeyQueryMutationRequest'
import { main } from '@/main'
import type { BucketInterface } from '@/modules/leaky-bucket/bucket'
import { buckets } from '@/modules/leaky-bucket/buckets'
import { describe, expect, it, vi } from 'vitest'

const { bacenProviderMock: accountBacenProviderMock } = vi.hoisted(() => {
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
    bacenProvider: accountBacenProviderMock
  }
})

const { bacenProviderMock: transactionBacenProviderMock } = vi.hoisted(() => {
  const e2eid = 'E290202410050406yTHHLXDvOvV'
  const bacenProviderMock = {
    createPixTransaction: vi.fn().mockResolvedValue({
      data: {
        BacenCreatePixTransaction: {
          error: null,
          success: 'Pix payment make with successfully',
          originPixKey: 'hallex.costa@hotmail.com',
          destinationPixKey: 'hallex.costa1@hotmail.com',
          e2eid,
          transaction: {
            id: 'transaction:1',
            publicId: 123456789,
            pixKey: 'hallex.costa@hotmail.com',
            amount: 100,
            e2eid,
            accountId: 'account:1',
            account: {
              id: 'YWNjb3VudDphY2NvdW50OjE=',
              publicId: 173532351,
              balance: null,
              status: 'PAID',
              createdAt: '2024-10-08T23:58:24.967Z',
              updatedAt: '1970-01-01T00:00:00.000Z'
            },
            createdAt: new Date(),
            updatedAt: null
          }
        }
      }
    })
  }

  return {
    bacenProviderMock
  }
})

vi.mock('@/modules/transaction/providers/bacenProvider', async () => {
  const mod = await import('@/modules/transaction/providers/bacenProvider')
  return {
    ...mod,
    bacenProvider: transactionBacenProviderMock
  }
})

describe('CreatePixTranasction', () => {
  it('should be create pix transaction without pre PixKeyQuery', async () => {
    const onceSpy = vi.spyOn(EventEmitter.prototype, 'once')
    const emitSpy = vi.spyOn(EventEmitter.prototype, 'emit')

    const {
      token: token1,
      tenant: tenant1,
      user: user1
    } = await createToken({
      user: {
        pixKey: 'hallex.costa@hotmail.com'
      }
    })
    const {
      token: token2,
      tenant: tenant2,
      user: user2
    } = await createToken({
      tenant: {
        id: tenant1.id
      },
      user: {
        pixKey: 'hallex.costa1@hotmail.com'
      }
    })

    const app = await main()
    const { data, errors } = await makeCreatePixTransactionMutationRequest(
      app,
      token1,
      { pixKey: user2.pixKey }
    )
    expect(accountBacenProviderMock.dictKeyCheck).toBeCalledWith(user2.pixKey)
    const expectedAmount = 100
    expect(transactionBacenProviderMock.createPixTransaction).toBeCalledWith(
      user1.pixKey,
      user2.pixKey,
      expectedAmount
    )

    const { CreatePixTransaction } = data

    expect(CreatePixTransaction.success).not.toBeNull()
    expect(CreatePixTransaction.error).toBeNull()
    expect(CreatePixTransaction.pixKeyQueryRequestId).not.toBeNull()

    const pixOutEventId = `PIX_OUT:${CreatePixTransaction.pixKeyQueryRequestId}`
    expect(onceSpy).toBeCalledWith(pixOutEventId, expect.any(Function))
    expect(emitSpy).toBeCalledWith(pixOutEventId, {
      destinationPixKey: user2.pixKey,
      originPixKey: user1.pixKey
    })

    const bucketId = `PixKeyQuery:${tenant1.id}:${user1.id}`
    const bucket = buckets.get(bucketId) as BucketInterface
    expect(bucket?.getState().currentCapacity).toBe(10)
  })

  it('should be create pix transaction with pre PixKeyQuery', async () => {
    const onceSpy = vi.spyOn(EventEmitter.prototype, 'once')

    const {
      token: token1,
      tenant: tenant1,
      user: user1
    } = await createToken({
      user: {
        pixKey: 'hallex.costa@hotmail.com'
      }
    })

    const {
      token: token2,
      tenant: tenant2,
      user: user2
    } = await createToken({
      tenant: {
        id: tenant1.id
      },
      user: {
        pixKey: 'hallex.costa1@hotmail.com'
      }
    })

    const app = await main()
    const { data: pixKeyQueryData } = await makePixKeyQueryMutationRequest(
      app,
      token1,
      { pixKey: user2.pixKey }
    )
    const pixKeyQueryRequestId = pixKeyQueryData.PixKeyQuery.requestId

    const bucket = buckets.get(
      `PixKeyQuery:${tenant1.id}:${user1.id}`
    ) as BucketInterface
    expect(onceSpy).toBeCalledWith(
      `PIX_OUT:${pixKeyQueryRequestId}`,
      expect.any(Function)
    )

    expect(accountBacenProviderMock.dictKeyCheck).toBeCalledWith(user2.pixKey)

    const emitSpy = vi.spyOn(bucket.eventEmitter, 'emit')
    const { data, errors } = await makeCreatePixTransactionMutationRequest(
      app,
      token1,
      { pixKeyQueryRequestId, pixKey: user2.pixKey }
    )

    const expectedAmount = 100
    expect(transactionBacenProviderMock.createPixTransaction).toBeCalledWith(
      user1.pixKey,
      user2.pixKey,
      expectedAmount
    )

    const { CreatePixTransaction } = data

    expect(CreatePixTransaction.success).not.toBeNull()
    expect(CreatePixTransaction.error).toBeNull()
    expect(CreatePixTransaction.pixKeyQueryRequestId).not.toBeNull()

    expect(emitSpy).toBeCalledWith(`PIX_OUT:${pixKeyQueryRequestId}`, {
      destinationPixKey: user2.pixKey,
      originPixKey: user1.pixKey
    })
  })
  it('should be refill PixKeyQueryBucket if PixKeyQuery was converted to PixOut (PixPayment)', async () => {
    const {
      token: token1,
      tenant: tenant1,
      user: user1
    } = await createToken({
      user: {
        pixKey: 'hallex.costa@hotmail.com'
      }
    })

    const {
      token: token2,
      tenant: tenant2,
      user: user2
    } = await createToken({
      tenant: {
        id: tenant1.id
      },
      user: {
        pixKey: 'hallex.costa1@hotmail.com'
      }
    })
    // const tenant1 = await createTenant()
    // const user1 = await createUser({
    // 	tenantId: tenant1.id,
    // 	pixKey: 'hallex.costa@hotmail.com'
    // })
    // const account1 = await createAccount({
    // 	userId: user1.id,
    // 	tenantId: tenant1.id
    // })

    // const token1 = jwt.sign(
    // 	{
    // 		userPublicId: user1.publicId,
    // 		accountPublicId: account1.publicId,
    // 		tenantPublicId: tenant1.publicId
    // 	},
    // 	config.JWT_SECRET,
    // 	{
    // 		expiresIn: '1h'
    // 	}
    // )

    // const user2 = await createUser({
    // 	tenantId: tenant1.id,
    // 	pixKey: 'hallex.costa1@hotmail.com'
    // })
    // const account2 = await createAccount({
    // 	userId: user2.id,
    // 	tenantId: tenant1.id
    // })

    // dont uncomment
    // const token2 = jwt.sign(
    // 	{
    // 		userPublicId: user2.publicId,
    // 		accountPublicId: account2.publicId,
    // 		tenantPublicId: tenant1.publicId
    // 	},
    // 	config.JWT_SECRET,
    // 	{
    // 		expiresIn: '1h'
    // 	}
    // )

    const onceSpy = vi.spyOn(EventEmitter.prototype, 'once')
    // this cause bug of infinity loop
    // const emitSpy = vi.spyOn(EventEmitter.prototype, 'emit')

    const app = await main()
    const { data: pixKeyQueryData, errors: pixKeyQueryErrors } =
      await makePixKeyQueryMutationRequest(app, token1, {
        pixKey: user2.pixKey
      })

    const pixKeyQueryRequestId = pixKeyQueryData.PixKeyQuery.requestId
    const bucket = buckets.get(
      `PixKeyQuery:${tenant1.id}:${user1.id}`
    ) as BucketInterface
    expect(onceSpy).toBeCalledWith(
      `PIX_OUT:${pixKeyQueryRequestId}`,
      expect.any(Function)
    )

    const expectedPixKey = user2.pixKey
    expect(accountBacenProviderMock.dictKeyCheck).toBeCalledWith(expectedPixKey)

    // this solve the inifity loop bug
    const emitSpy = vi.spyOn(bucket.eventEmitter, 'emit')
    const { data, errors } = await makeCreatePixTransactionMutationRequest(
      app,
      token1,
      { pixKeyQueryRequestId, pixKey: user2.pixKey }
    )

    const expectedAmount = 100
    expect(transactionBacenProviderMock.createPixTransaction).toBeCalledWith(
      user1.pixKey,
      user2.pixKey,
      expectedAmount
    )

    const { CreatePixTransaction } = data

    expect(CreatePixTransaction.success).not.toBeNull()
    expect(CreatePixTransaction.error).toBeNull()
    expect(CreatePixTransaction.pixKeyQueryRequestId).not.toBeNull()

    expect(emitSpy).toBeCalledWith(`PIX_OUT:${pixKeyQueryRequestId}`, {
      destinationPixKey: user2.pixKey,
      originPixKey: user1.pixKey
    })
    expect(bucket.getState().currentCapacity).toBe(10)
  })
  it('should be return error message if try transfer to the same pix key', async () => {
    // the default key pix from user is "hallex.costa@hotmail.com"
    const { token, tenant, user } = await createToken()

    const app = await main()
    const { data: pixKeyQueryData } = await makePixKeyQueryMutationRequest(
      app,
      token
    )
    const pixKeyQueryRequestId = pixKeyQueryData.PixKeyQuery.requestId

    const bucket = buckets.get(
      `PixKeyQuery:${tenant.id}:${user.id}`
    ) as BucketInterface

    const { data, errors } = await makeCreatePixTransactionMutationRequest(
      app,
      token,
      { pixKeyQueryRequestId, pixKey: 'hallex.costa@hotmail.com' }
    )
    const { CreatePixTransaction } = data

    expect(CreatePixTransaction.error).toBe(
      'Cannot transfer to the same pixKey'
    )

    expect(bucket.getState().currentCapacity).toBe(9)
  })
  it('should be return error message if try transfer to pixKey that belongs another tenant', async () => {
    // the default key pix from user is always "hallex.costa@hotmail.com"
    const { token, tenant, user } = await createToken()

    // change the pix key another user and create another tenant
    const {
      token: token2,
      tenant: tenant2,
      user: user2
    } = await createToken({
      user: { pixKey: 'hallex.costa1@hotmail.com' }
    })

    const app = await main()
    const { data: pixKeyQueryData } = await makePixKeyQueryMutationRequest(
      app,
      token
    )
    const pixKeyQueryRequestId = pixKeyQueryData.PixKeyQuery.requestId

    const bucket = buckets.get(
      `PixKeyQuery:${tenant.id}:${user.id}`
    ) as BucketInterface

    const { data, errors } = await makeCreatePixTransactionMutationRequest(
      app,
      token,
      { pixKeyQueryRequestId, pixKey: user2.pixKey }
    )
    const { CreatePixTransaction } = data

    expect(CreatePixTransaction.error).toBe(
      'This pixKey is not linked to any user or belongs a another tenant'
    )

    expect(bucket.getState().currentCapacity).toBe(9)
  })
})
