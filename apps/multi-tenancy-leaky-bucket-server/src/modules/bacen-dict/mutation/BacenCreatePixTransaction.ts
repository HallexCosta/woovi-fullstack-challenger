import { outputFields } from '@/modules/graphql/outputFields'
import { generateUniqueIntId, left, right } from '@woovi/server-utils'
import { GraphQLInt, GraphQLNonNull, GraphQLString } from 'graphql'
import { mutationWithClientMutationId, toGlobalId } from 'graphql-relay'
import { BacenTransactionEdge } from '../BacenTransactionType'
import { createOrGetBacenPixQueryBucket } from '../bucket/createOrGetBacenPixQueryBucket'
import { bacen } from '../database/bacen'
import { bacenPixKeyQueryService } from '../services/bacenPixKeyQueryService'

export const BacenCreatePixTransaction = mutationWithClientMutationId({
  name: 'BacenCreatePixTransaction',
  inputFields: {
    originPixKey: {
      type: new GraphQLNonNull(GraphQLString)
    },
    destinationPixKey: {
      type: new GraphQLNonNull(GraphQLString)
    },
    e2eid: {
      type: GraphQLString
    },
    amount: {
      type: new GraphQLNonNull(GraphQLInt)
    }
  },
  mutateAndGetPayload: async (
    { originPixKey, destinationPixKey, amount, e2eid },
    context,
    info
  ) => {
    if (originPixKey === destinationPixKey) {
      return left('Cannot transfer to the same pix key')
    }

    const bucket = createOrGetBacenPixQueryBucket()
    if (!bucket) {
      return left('You try make payment without pass in pix key check ')
    }

    if (!bucket.getState().currentCapacity) {
      return left('Too many request pix key check')
    }

    if (!e2eid) {
      const [data, error] = bacenPixKeyQueryService(destinationPixKey, {
        bucket
      })

      if (error) {
        console.log('bacen', bucket.getState())
        return left(error.message)
      }
      e2eid = data.e2eid
    }

    const eventId = `PIX_OUT:${e2eid}`
    if (!bucket.eventEmitter.eventNames().includes(eventId)) {
      return left('e2eid is invalid or the pix payment has expired', {
        transactions: null
      })
    }

    const transactionId = `transaction:${bacen.get('transactions')?.size}`
    const transaction = {
      id: transactionId,
      destinationPixKey,
      originPixKey,
      amount,
      e2eid,
      accountId: 'account:1',
      createdAt: new Date(),
      updatedAt: null
    }
    console.log({ transaction })

    bacen.get('transactions')?.set(transactionId, transaction)
    bucket.eventEmitter.emit(eventId)

    return right('Pix payment make with successfully', {
      transaction
    })
  },
  outputFields: outputFields({
    transactionEdge: {
      type: BacenTransactionEdge,
      resolve: ({ transaction }) => {
        if (!transaction) return null

        return {
          cursor: toGlobalId('BacenTransaction', transaction.id),
          node: transaction
        }
      }
    }
  })
})
