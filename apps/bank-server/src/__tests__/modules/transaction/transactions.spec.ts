import { gql } from '@/__tests__/setup/utils/gql'
import { describe, expect, it, vi } from 'vitest'

import { createTransaction } from '@/__tests__/setup/fixtures/createTransaction'
import { main } from '@/main'
import { Account } from '@/modules/account/AccountModel'
import {
  TransactionStatusEnum,
  TransactionTypeEnum
} from '@/modules/transaction/TransactionModel'
import supertest from 'supertest-graphql'

describe('transactions query', () => {
  it('should be list all transactions by account public id', async () => {
    const transaction = await createTransaction({
      type: TransactionTypeEnum.PIX,
      status: TransactionStatusEnum.PAID,
      idempotencyKey: 'some-key'
    })

    const account = await Account.findOne({
      _id: transaction.originSenderAccountId
    })

    const query = gql`
      query ListTransactions($accountPublicId: Int!) {
        transactions(accountPublicId: $accountPublicId) {
          edges {
            node {
              id
              type
              status
              amount
              destinationReceiverAccount {
                user {
                  publicId
                }
                publicId
              }
              originSenderAccount {
                user {
                  id
                }
                publicId
              }
              idempotencyKey
            }
          }
        }
      }
    `
    const app = await main()
    const response = await supertest(app.callback())
      .query(query)
      .variables({ accountPublicId: account?.publicId })
      .end()

    const { transactions } = response.data

    expect(transactions.edges.length === 1).toBeTruthy()
    const transactionEdge = transactions.edges[0]
    expect(transactionEdge.node.idempotencyKey).toBe(transaction.idempotencyKey)
    expect(transactionEdge.node.originSenderAccount).not.toBeNull()
    expect(transactionEdge.node.destinationReceiverAccount).not.toBeNull()
    expect(transactionEdge.node.status).toBe(TransactionStatusEnum.PAID)
    expect(transactionEdge.node.type).toBe(TransactionTypeEnum.PIX)
  })
})
