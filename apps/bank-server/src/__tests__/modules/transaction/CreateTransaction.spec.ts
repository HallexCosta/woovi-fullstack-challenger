import { gql } from '@/__tests__/setup/utils/gql'
import { describe, expect, it, vi } from 'vitest'

import { createAccount } from '@/__tests__/setup/fixtures/createAccount'
import { createUser } from '@/__tests__/setup/fixtures/createUser'
import { generateUniqueIntId } from '@/common/generateUniqueIntId'
import { main } from '@/main'
import request from 'supertest-graphql'

import { randomUUID } from 'node:crypto'
import * as caches from '@/common/cache'
import { Account } from '@/modules/account/AccountModel'
import { createPromiseWithResolvers } from '@woovi/utils'

describe('CreateTransactionMutation', () => {
  it('Should be don´t allow create duplicate transactions and the second transaction should give from the cache', async () => {
    const originUser = await createUser({})
    const destUser = await createUser({})

    const originAccount = await createAccount({
      userId: originUser._id,
      publicId: generateUniqueIntId(),
      balance: 100
    })
    const destAccount = await createAccount({
      userId: destUser._id,
      publicId: generateUniqueIntId(),
      balance: 0
    })

    const query = gql`
      mutation CreateTransactionMutation($input: CreateTransactionInput!) {
        CreateTransaction(input: $input) {
          error
          success
          cache
          transactionEdge {
            node {
              amount
              destinationReceiverAccount {
                id
              }
              originSenderAccount {
                id
              }
            }
          }
        }
      }
    `

    // disabling cache while testing this operation
    vi.spyOn(caches, 'cache').mockImplementation(() => null)

    const payload = {
      variables: {
        input: {
          originSenderAccountPublicId: originAccount.publicId,
          destinationReceiverAccountPublicId: destAccount.publicId,
          amount: 100,
          idempotencyKey: 'same-idempotency-key'
        }
      }
    }

    const app = await main()

    // const [{ data: response1 }, { data: response2 }] = await Promise.all([
    // ])

    const response1 = await request(app.callback())
      .query(query)
      .variables(payload.variables)
      .end()

    const response2 = await request(app.callback())
      .query(query)
      .variables(payload.variables)
      .end()

    expect(response1.data.CreateTransaction.success).toBe(
      'Transfer completed successfully'
    )
    expect(response1.data.CreateTransaction.cache).not.toBeTruthy()
    expect(response2.data.CreateTransaction.success).toBe(
      'Transfer completed successfully'
    )
    expect(response2.data.CreateTransaction.cache).toBeTruthy()
  })

  it('Should be return error message if origin balance account if zero or negative amount', async () => {
    const originUser = await createUser({
      // publicId: 12345678
    })
    const destUser = await createUser({
      // publicId: 87654321
    })

    const originAccount = await createAccount({
      userId: originUser._id,
      publicId: generateUniqueIntId(),
      balance: 0
    })
    const destAccount = await createAccount({
      userId: destUser._id,
      publicId: generateUniqueIntId(),
      balance: 0
    })

    const query = gql`
      mutation CreateTransactionMutation($input: CreateTransactionInput!) {
        CreateTransaction(input: $input) {
          error
          success
          transactionEdge {
            node {
              amount
              destinationReceiverAccount {
                id
              }
              originSenderAccount {
                id
              }
            }
          }
        }
      }
    `

    // disabling cache while testing this operation
    vi.spyOn(caches, 'cache').mockImplementation(() => null)

    const payload = {
      variables: {
        input: {
          originSenderAccountPublicId: originAccount.publicId,
          destinationReceiverAccountPublicId: destAccount.publicId,
          amount: 100,
          idempotencyKey: 'some-key'
        }
      }
    }

    const app = await main()

    const { data } = await request(app.callback())
      .query(query)
      .variables(payload.variables)
      // .auth('Bearer ${}')
      .end()

    const {
      CreateTransaction: { error, success }
    } = data
    expect(error).toBe(
      'Origin account can not transfer because the balance is zero'
    )
    expect(success).toBeNull()
  })

  it('Should be make transaction transaction between two accounts', async () => {
    const originUser = await createUser({})
    const destUser = await createUser({})

    const originAccount = await createAccount({
      userId: originUser._id,
      publicId: generateUniqueIntId(),
      balance: 100
    })
    const destAccount = await createAccount({
      userId: destUser._id,
      publicId: generateUniqueIntId(),
      balance: 0
    })

    const query = gql`
	    mutation CreateTransactionMutation($input: CreateTransactionInput!) {
	      CreateTransaction(input: $input) {
	        error
	        success
	        transactionEdge {
	          node {
	            amount
	            destinationReceiverAccount {
	              id
                balance
	            }
	            originSenderAccount {
	              id
                balance
	            }
	          }
	        }
	      }
	    }
	  `

    const payload = {
      variables: {
        input: {
          originSenderAccountPublicId: originAccount.publicId,
          destinationReceiverAccountPublicId: destAccount.publicId,
          amount: 100,
          idempotencyKey: 'uuid'
        }
      }
    }

    const app = await main()

    const { data } = await request(app.callback())
      .query(query)
      .variables(payload.variables)
      // .auth('Bearer ${}')
      .end()

    const {
      CreateTransaction: { error, success, transactionEdge }
    } = data
    expect(error).toBeNull()
    expect(success).toBe('Transfer completed successfully')

    expect(transactionEdge.node.originSenderAccount.balance).toBe(0)
    expect(transactionEdge.node.destinationReceiverAccount.balance).toBe(
      payload.variables.input.amount
    )
  })

  it('Should be return error message if origin account or destination account not found', async () => {
    const query = gql`
	    mutation CreateTransactionMutation($input: CreateTransactionInput!) {
	      CreateTransaction(input: $input) {
	        error
	        success
	        transactionEdge {
	          node {
	            amount
	            destinationReceiverAccount {
	              id
                balance
	            }
	            originSenderAccount {
	              id
                balance
	            }
	          }
	        }
	      }
	    }
	  `

    const payload = {
      variables: {
        input: {
          originSenderAccountPublicId: 123,
          destinationReceiverAccountPublicId: 312,
          amount: 100,
          idempotencyKey: 'some-idempotency-key'
        }
      }
    }

    const app = await main()

    const { data } = await request(app.callback())
      .query(query)
      .variables(payload.variables)
      // .auth('Bearer ${}')
      .end()

    const {
      CreateTransaction: { error, success, transactionEdge }
    } = data
    expect(success).toBeNull()
    expect(error).toBe('Origin or destination account not found')

    expect(transactionEdge).toBeNull()
  })

  it('should be lock origin and destination account while access simultaneously the records', async () => {
    const originUser = await createUser({})
    const destUser = await createUser({})

    const originAccount = await createAccount({
      userId: originUser._id,
      publicId: generateUniqueIntId(),
      balance: 1000
    })
    const destinationAccount = await createAccount({
      userId: destUser._id,
      publicId: generateUniqueIntId(),
      balance: 1000
    })

    const query = gql`
      mutation CreateTransactionMutation($input: CreateTransactionInput!) {
        CreateTransaction(input: $input) {
          error
          success
          transactionEdge {
            node {
              amount
              destinationReceiverAccount {
                id
                balance
              }
              originSenderAccount {
                id
                balance
              }
            }
          }
        }
      }
    `

    const app = await main()

    const entryAmounts: number[] = []
    const outAmounts: number[] = []

    const match = {
      entry: (amount: number) => {
        const absoluteAmount = Math.abs(amount)
        const originSenderAccountPublicId = destinationAccount.publicId
        const destinationReceiverAccountPublicId = originAccount.publicId
        entryAmounts.push(absoluteAmount)
        return {
          absoluteAmount,
          originSenderAccountPublicId,
          destinationReceiverAccountPublicId
        }
      },
      out: (amount: number) => {
        const absoluteAmount = Math.abs(amount)
        const originSenderAccountPublicId = originAccount.publicId
        const destinationReceiverAccountPublicId = destinationAccount.publicId
        outAmounts.push(absoluteAmount)
        return {
          absoluteAmount,
          originSenderAccountPublicId,
          destinationReceiverAccountPublicId
        }
      }
    }

    const transactions = []
    const totalTransactions = 10 // number of transactions
    const supertest = request(app.callback())

    let timelapse = 2
    for (let i = 0; i < totalTransactions; i++) {
      if (i === timelapse) {
        timelapse += timelapse
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }

      const amount = Math.random() < 0.5 ? 1 : -1
      const {
        absoluteAmount,
        originSenderAccountPublicId,
        destinationReceiverAccountPublicId
      } = match[amount > 0 ? 'entry' : 'out'](amount)

      transactions.push(
        supertest
          .query(query)
          .variables({
            input: {
              originSenderAccountPublicId,
              destinationReceiverAccountPublicId,
              amount: absoluteAmount,
              idempotencyKey: randomUUID()
            }
          })
          .end()
      )
    }

    const results = await Promise.allSettled(transactions)
    const success = results
      .map((result) => result.value.data.CreateTransaction.success)
      .filter(Boolean)
    const fails = results
      .map((result) => result.value.data.CreateTransaction.error)
      .filter(Boolean)
    console.log({ success, fails })

    // expect(success.length).toBe(1)
    // expect(fails.length).toBe(2)

    expect(
      success.every((msg) => msg === 'Transfer completed successfully')
    ).toBeTruthy()
    expect(
      fails.every((msg) => msg === 'Origin or destination account are locked')
    ).toBeTruthy()
  })

  it('should be consistency in origin and destination account balance while is make simultaneous transactions', async () => {
    const originUser = await createUser({})
    const destUser = await createUser({})

    const originAccount = await createAccount({
      userId: originUser._id,
      publicId: generateUniqueIntId(),
      locked: false,
      lockDuration: 1000,
      balance: 1000
    })
    const destinationAccount = await createAccount({
      userId: destUser._id,
      publicId: generateUniqueIntId(),
      locked: false,
      lockDuration: 1000,
      balance: 1000
    })

    const query = gql`
      mutation CreateTransactionMutation($input: CreateTransactionInput!) {
        CreateTransaction(input: $input) {
          error
          success
          transactionEdge {
            node {
              amount
              destinationReceiverAccount {
                id
                balance
                publicId
                locked
              }
              originSenderAccount {
                id
                balance
                publicId
                locked
              }
            }
          }
        }
      }
    `

    const app = await main()

    const entryAmounts: number[] = []
    const outAmounts: number[] = []

    const match = {
      entry: (amount: number) => {
        const absoluteAmount = Math.abs(amount)
        const originSenderAccountPublicId = destinationAccount.publicId
        const destinationReceiverAccountPublicId = originAccount.publicId
        return {
          absoluteAmount,
          originSenderAccountPublicId,
          destinationReceiverAccountPublicId
        }
      },
      out: (amount: number) => {
        const absoluteAmount = Math.abs(amount)
        const originSenderAccountPublicId = originAccount.publicId
        const destinationReceiverAccountPublicId = destinationAccount.publicId
        return {
          absoluteAmount,
          originSenderAccountPublicId,
          destinationReceiverAccountPublicId
        }
      }
    }

    const transactions = []
    const totalTransactions = 2 // number of transactions in pars
    let timelapse = 2
    const supertest = request(app.callback())
    let countTimer = 1
    const createTransactionAsync =
      (
        originSenderAccountPublicId: number,
        destinationReceiverAccountPublicId: number,
        absoluteAmount: number
      ) =>
      async () => {
        const { promise, resolve } = createPromiseWithResolvers()

        setTimeout(async () => {
          resolve(
            await supertest
              .query(query)
              .variables({
                input: {
                  originSenderAccountPublicId,
                  destinationReceiverAccountPublicId,
                  amount: absoluteAmount,
                  idempotencyKey: randomUUID()
                }
              })
              .end()
          )
        }, 40 * countTimer++)
        return promise
        // return await supertest
        //   .query(query)
        //   .variables({
        //     input: {
        //       originSenderAccountPublicId,
        //       destinationReceiverAccountPublicId,
        //       amount: absoluteAmount,
        //       idempotencyKey: randomUUID()
        //     }
        //   })
        //   .end()
      }

    for (let i = 0; i < totalTransactions; i++) {
      const amount = Math.random() < 0.5 ? 1 : -1
      const {
        absoluteAmount,
        originSenderAccountPublicId,
        destinationReceiverAccountPublicId
      } = match[amount > 0 ? 'entry' : 'out'](amount)

      transactions.push(
        createTransactionAsync(
          originSenderAccountPublicId,
          destinationReceiverAccountPublicId,
          absoluteAmount
        )
      )
    }

    const simultaneousRequests = new Map()
    let count = 1
    while (transactions.length) {
      const transactionsInTimelapse = transactions
        .splice(0, timelapse)
        .map((callTransaction) => callTransaction())

      const results = await Promise.allSettled(transactionsInTimelapse)

      for (const result of results) {
        const createTransaction = result.value.data?.CreateTransaction
        console.log({ createTransaction: result.value.data })
        simultaneousRequests.set(
          count,
          simultaneousRequests.get(count)
            ? [...simultaneousRequests.get(count), createTransaction]
            : [createTransaction]
        )
        if (
          createTransaction?.transactionEdge?.node.originSenderAccount
            .publicId === destinationAccount.publicId
        ) {
          entryAmounts.push(1)
        }

        if (
          createTransaction?.transactionEdge?.node.destinationReceiverAccount
            .publicId === destinationAccount.publicId
        ) {
          outAmounts.push(1)
        }
      }

      timelapse += timelapse
      count++
    }
    console.log({
      locked: await Account.findOne({
        publicId: originAccount.publicId
        // locked: false
      })
    })

    const success = [...simultaneousRequests.entries()]
      .map(([key, timelapseRequests]) => {
        return timelapseRequests
          .map((timelapseRequest: any) => timelapseRequest.success)
          .filter(Boolean)
      })
      .reduce((prev: any[], curr: any[]) => {
        return curr.concat(prev)
      }, [])

    const fails = [...simultaneousRequests.entries()]
      .map(([key, timelapseRequests]) => {
        return timelapseRequests
          .map((timelapseRequest: any) => timelapseRequest.error)
          .filter(Boolean)
      })
      .reduce((prev: any[], curr) => {
        return curr.concat(prev)
      }, [])

    console.log({ success, fails })

    const entry = entryAmounts.reduce(
      (prev: number, curr: number) => prev + curr,
      0
    ) as number
    const out = outAmounts.reduce(
      (prev: number, curr: number) => prev + curr,
      0
    ) as number

    const expectedOriginBalance = originAccount.balance + entry - out
    const expectedDestinationBalance = destinationAccount.balance + out - entry
    console.log({
      expectedOriginBalance,
      expectedDestinationBalance,
      entry,
      out
    })
    const afterOriginAccount = await Account.findOne({
      _id: originAccount._id
    })

    const afterDestinationAccount = await Account.findOne({
      _id: destinationAccount._id
    })
    console.log(afterOriginAccount, afterDestinationAccount)
    expect(expectedOriginBalance).toBe(afterOriginAccount?.balance)
    expect(expectedDestinationBalance).toBe(afterDestinationAccount?.balance)

    expect(success.length).not.toBeGreaterThanOrEqual(2)
    expect(fails.length).toBeGreaterThanOrEqual(1)
  })
})
