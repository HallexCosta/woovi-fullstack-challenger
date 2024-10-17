import { getBucketId } from '@/common/getBucketId'
import { middlewareUserBearerTokenAuthorization } from '@/entrypoint/middlewares/middlewareUserBearerAuthorization'
import { AccountLoader } from '@/modules/account/AccountLoader'
import { createOrGetPixQueryBucket } from '@/modules/account/bucket/createOrGetPixQueryBucket'
import { bacenProvider as accountBacenProvider } from '@/modules/account/providers/bacenProvider'
import { pixKeyQueryService } from '@/modules/account/services/pixKeyQueryService'
import { outputFields } from '@/modules/graphql/outputFields'
import type { BucketInterface } from '@/modules/leaky-bucket/bucket'
import { buckets } from '@/modules/leaky-bucket/buckets'
import { bacenProvider as transactionBacenProvider } from '@/modules/transaction/providers/bacenProvider'
import { UserLoader } from '@/modules/user/UserLoader'
import { generateUniqueIntId, left, right } from '@woovi/server-utils'
import { GraphQLInt, GraphQLNonNull, GraphQLString } from 'graphql'
import { mutationWithClientMutationId, toGlobalId } from 'graphql-relay'
import { Transaction } from '../TransactionModel'
import { TransactionEdge } from '../TransactionType'

export const CreatePixTransaction = mutationWithClientMutationId({
  name: 'CreatePixTransaction',
  description:
    'This mutation will be subject to the rules of PixKeyQueryBucket',
  inputFields: {
    pixKey: {
      type: new GraphQLNonNull(GraphQLString)
    },
    amount: {
      type: new GraphQLNonNull(GraphQLInt)
    },
    pixKeyQueryRequestId: {
      type: GraphQLString
    }
  },
  mutateAndGetPayload: middlewareUserBearerTokenAuthorization(
    'mutation',
    async ({ pixKey, amount, pixKeyQueryRequestId }, context, info) => {
      if (pixKey === context.user.pixKey) {
        return left('Cannot transfer to the same pixKey')
      }

      const destinationUser = await UserLoader.load({
        pixKey,
        tenantId: context.user.tenantId
      })

      if (!destinationUser) {
        return left(
          'This pixKey is not linked to any user or belongs a another tenant'
        )
      }

      if (!pixKeyQueryRequestId) {
        const bucket = createOrGetPixQueryBucket(
          context.user
        ) as BucketInterface
        const bucketCurrentCapacity = bucket.getState().currentCapacity

        if (!bucketCurrentCapacity) {
          return left('You reached the rate limit of pix key query')
        }

        bucket.rollbackToken(-1)
        const [data, error] = await pixKeyQueryService(pixKey, {
          bucket
        })

        if (error) {
          return left(error.message, {
            transactions: null
          })
        }

        pixKeyQueryRequestId = data.requestId
      }

      console.log('userId', context.user.id)
      console.log('destinationUserId', destinationUser.id)
      const transaction = new Transaction({
        publicId: generateUniqueIntId(),
        tenantId: context.user.tenantId,
        originUserId: context.user.id, // origin account
        destinationUserId: destinationUser.id, // destination account
        amount,
        createdAt: new Date(),
        updatedAt: null
      })
      await transaction.save()

      const { data, errors } =
        await transactionBacenProvider.createPixTransaction(
          context.user.pixKey,
          pixKey,
          amount
        )
      const { BacenCreatePixTransaction } = data

      const bucket = createOrGetPixQueryBucket(context.user)
      bucket?.eventEmitter.emit(`PIX_OUT:${pixKeyQueryRequestId}`, {
        destinationPixKey: pixKey,
        originPixKey: context.user.pixKey
      })

      return right(BacenCreatePixTransaction.success, {
        transaction,
        pixKeyQueryRequestId:
          pixKeyQueryRequestId ?? BacenCreatePixTransaction.e2eid
      })
    }
  ),
  outputFields: outputFields({
    transactionEdge: {
      type: TransactionEdge,
      resolve: ({ transaction }) => {
        if (!transaction) return null

        return {
          cursor: toGlobalId('transaction', transaction.id),
          node: transaction
        }
      }
    },
    pixKeyQueryRequestId: {
      type: GraphQLString,
      resolve: ({ pixKeyQueryRequestId }) => pixKeyQueryRequestId
    }
  })
})
