import { cache, getCache } from '@/common/cache'
import { generateUniqueIntId } from '@/common/generateUniqueIntId'
import { AccountLoader } from '@/modules/account/AccountLoader'
import { AccountOperation } from '@/modules/account/AccountOperation'
import {
  GraphQLBoolean,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLString
} from '@/modules/graphql'
import { outputFields } from '@/modules/graphql/outputFields'
import { mutationWithClientMutationId, toGlobalId } from 'graphql-relay'
import { Transaction } from '../TransactionModel'
import { TransactionEdge } from '../TransactionType'

export const CreateTransaction = mutationWithClientMutationId({
  name: 'CreateTransaction',
  inputFields: {
    amount: {
      type: new GraphQLNonNull(GraphQLInt)
    },
    destinationReceiverAccountPublicId: {
      type: new GraphQLNonNull(GraphQLInt)
    },
    originSenderAccountPublicId: {
      type: new GraphQLNonNull(GraphQLInt)
    },
    idempotencyKey: {
      type: new GraphQLNonNull(GraphQLString)
    }
  },
  mutateAndGetPayload: async ({
    amount,
    originSenderAccountPublicId,
    destinationReceiverAccountPublicId,
    idempotencyKey
  }) => {
    // const session = await mongoose.startSession()
    // session.startTransaction()

    const originAccount = await AccountLoader.loadByPublicIdAndLock(
      originSenderAccountPublicId
      // session
    )
    const destinationAccount = await AccountLoader.loadByPublicIdAndLock(
      destinationReceiverAccountPublicId
      // session
    )

    if (!originAccount || !destinationAccount) {
      return {
        error: 'Origin or destination account not found',
        success: null,
        transaction: null
      }
    }

    if (originAccount.locked || destinationAccount.locked) {
      const currentTime = +new Date()

      if (
        !(
          currentTime >
          originAccount.lockTimestamp + originAccount.lockDuration
        ) ||
        !(
          currentTime >
          destinationAccount.lockTimestamp + destinationAccount.lockDuration
        )
      ) {
        return {
          error: 'Origin or destination account are locked',
          success: null,
          transaction: null
        }
      }
    }

    const alreadyTransactionMakeCache = await getCache(idempotencyKey)

    let alreadyTransactionMake = null
    if (!alreadyTransactionMakeCache) {
      alreadyTransactionMake = await Transaction.findOne({
        idempotencyKey
      })
      // .session(session)
    }

    if (alreadyTransactionMake) {
      await cache(
        idempotencyKey,
        JSON.stringify(alreadyTransactionMake.toObject({ getters: true })),
        60 * 5
      )
    }

    if (alreadyTransactionMake || alreadyTransactionMakeCache) {
      const transaction = alreadyTransactionMakeCache
        ? JSON.parse(alreadyTransactionMakeCache)
        : alreadyTransactionMake

      // await session.abortTransaction()
      return {
        success: 'Transfer completed successfully',
        cache: true,
        error: null,
        transaction: {
          ...transaction,
          amount: -transaction.amount,
          createdAt: new Date(transaction.createdAt).toISOString().slice(0, 10) // only date YYYY-MM-DD
        }
      }
    }

    if (originAccount.balance <= 0) {
      // await session.abortTransaction()
      return {
        success: null,
        cache: false,
        error: 'Origin account can not transfer because the balance is zero',
        transaction: null
      }
    }

    const publicId = generateUniqueIntId()

    await AccountOperation.debit(
      {
        originAccount,
        destinationAccount,
        transferAmount: amount
      }
      // session
    )

    console.log('saving transaction')
    const transaction = await Transaction.create(
      {
        publicId,
        amount,
        originSenderAccountId: originAccount.id,
        destinationReceiverAccountId: destinationAccount.id,
        status: 'PAID',
        type: 'PIX',
        idempotencyKey,
        createdAt: new Date(),
        updatedAt: null
      }
      // {
      //   session
      // }
    )
    console.log({ transaction })
    console.log('after save transaction')
    await cache(
      idempotencyKey,
      JSON.stringify(transaction.toObject({ getters: true })),
      60 * 5
    ) // 5 minutes

    // await session.commitTransaction()
    // await session.endSession()
    return {
      success: 'Transfer completed successfully',
      error: null,
      cache: false,
      transaction: {
        ...transaction.toObject({ getters: true }),
        amount: -transaction.amount,
        createdAt: new Date(transaction.createdAt).toISOString().slice(0, 10) // only date YYYY-MM-DD
      }
    }
  },

  // mutateAndGetPayload: async ({
  //   amount,
  //   originSenderAccountPublicId,
  //   destinationReceiverAccountPublicId,
  //   idempotencyKey
  // }) => {
  //   console.log(mongoose.connection)
  //   console.log('executei este codigo')
  //   const publicId = generateUniqueIntId()
  //   // const session = await mongoose.startSession()
  //   // session.startTransaction()

  //   const originAccount = await AccountLoader.loadByPublicId(
  //     originSenderAccountPublicId
  //   )
  //   const destinationAccount = await AccountLoader.loadByPublicId(
  //     destinationReceiverAccountPublicId
  //   )

  //   if (!originAccount || !destinationAccount) {
  //     return {
  //       error: 'Origin or destination account not found',
  //       success: null,
  //       transaction: null
  //     }
  //   }
  //   // originAccount.locked = true
  //   // destinationAccount.locked = true
  //   // // lock accounts
  //   // await Promise.all([originAccount.save(), destinationAccount.save()])

  //   const alreadyTransactionMakeCache = await getCache(idempotencyKey)

  //   let alreadyTransactionMake = null
  //   if (!alreadyTransactionMakeCache) {
  //     alreadyTransactionMake = await Transaction.findOne({
  //       idempotencyKey
  //     })
  //   }

  //   if (alreadyTransactionMake) {
  //     await cache(
  //       idempotencyKey,
  //       JSON.stringify(alreadyTransactionMake.toObject({ getters: true })),
  //       60 * 5
  //     )
  //   }

  //   if (alreadyTransactionMake || alreadyTransactionMakeCache) {
  //     const transaction = alreadyTransactionMakeCache
  //       ? JSON.parse(alreadyTransactionMakeCache)
  //       : alreadyTransactionMake

  //     return {
  //       success: 'Transfer completed successfully',
  //       cache: true,
  //       error: null,
  //       transaction: {
  //         ...transaction,
  //         amount: -transaction.amount,
  //         createdAt: new Date(transaction.createdAt).toISOString().slice(0, 10) // only date YYYY-MM-DD
  //       }
  //     }
  //   }

  //   if (originAccount.balance <= 0) {
  //     // Release locks
  //     // await releaseLocks([originAccount._id, destinationAccount._id], session)
  //     return {
  //       success: null,
  //       cache: false,
  //       error: 'Origin account can not transfer because the balance is zero',
  //       transaction: null
  //     }
  //   }

  //   const transaction = new Transaction({
  //     publicId,
  //     amount,
  //     originSenderAccountId: originAccount.id,
  //     destinationReceiverAccountId: destinationAccount.id,
  //     status: 'PAID',
  //     type: 'PIX',
  //     idempotencyKey,
  //     createdAt: new Date(),
  //     updatedAt: null
  //   })
  //   await transaction.save()

  //   AccountOperation.debit({
  //     originAccount,
  //     destinationAccount,
  //     transferAmount: amount
  //   })

  //   await Promise.allSettled([
  //     originAccount.save(),
  //     destinationAccount.save(),
  //     cache(
  //       idempotencyKey,
  //       JSON.stringify(transaction.toObject({ getters: true })),
  //       60 * 5
  //     ) // 5 minutes
  //   ])

  //   return {
  //     success: 'Transfer completed successfully',
  //     error: null,
  //     cache: false,
  //     transaction: {
  //       ...transaction.toObject({ getters: true }),
  //       amount: -transaction.amount,
  //       createdAt: new Date(transaction.createdAt).toISOString().slice(0, 10) // only date YYYY-MM-DD
  //     }
  //   }
  // },
  outputFields: outputFields({
    transactionEdge: {
      type: TransactionEdge,
      resolve: async ({ transaction }) => {
        if (!transaction) return null

        return {
          cursor: toGlobalId('Transaction', transaction._id),
          node: transaction
        }
      }
    },
    cache: {
      type: GraphQLBoolean,
      resolve: ({ cache }) => cache
    }
  })
})
