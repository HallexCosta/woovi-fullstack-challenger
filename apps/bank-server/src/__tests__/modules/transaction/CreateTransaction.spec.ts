import { gql } from '@/__tests__/setup/utils/gql'
import { describe, expect, it, vi } from 'vitest'

import { createAccount } from '@/__tests__/setup/fixtures/createAccount'
import { createUser } from '@/__tests__/setup/fixtures/createUser'
import { generateUniqueIntId } from '@/common/generateUniqueIntId'
import { main } from '@/main'
import request from 'supertest-graphql'

import * as caches from '@/common/cache'

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

    const [{ data: response1 }, { data: response2 }] = await Promise.all([
      await request(app.callback())
        .query(query)
        .variables(payload.variables)
        .end(),
      await request(app.callback())
        .query(query)
        .variables(payload.variables)
        .end()
    ])

    expect(response1.CreateTransaction.success).toBe(
      'Transfer completed successfully'
    )
    expect(response1.CreateTransaction.cache).not.toBeTruthy()
    expect(response2.CreateTransaction.success).toBe(
      'Transfer completed successfully'
    )
    expect(response2.CreateTransaction.cache).toBeTruthy()
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
})
