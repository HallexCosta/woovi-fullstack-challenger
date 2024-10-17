import { createAccount } from '@/__tests__/setup/fixtures/createAccount'
import { createTransaction } from '@/__tests__/setup/fixtures/createTransaction'
import { clearDatabase } from '@/__tests__/setup/mongodb/clearMemoryDb'
import { gql } from '@/__tests__/setup/utils/gql'
import { main } from '@/main'
import { Transaction } from '@/modules/transaction/TransactionModel'
import mongoose from 'mongoose'
import supertest from 'supertest-graphql'
import { describe, expect, it } from 'vitest'

describe('accounts query', () => {
  it('should be list transactions that belong an account', async () => {
    const account = await createAccount()
    const account2 = await createAccount()

    const account3 = await createAccount()
    const account4 = await createAccount()

    // one transaction without link to account1
    await createTransaction({
      originSenderAccountId: account3.id,
      destinationReceiverAccountId: account4.id
    })

    // two transaction for account1
    await createTransaction({
      originSenderAccountId: account.id,
      destinationReceiverAccountId: account2.id
    })
    await createTransaction({
      originSenderAccountId: account.id,
      destinationReceiverAccountId: account2.id
    })

    const query = gql`
      query ListAccount($accountPublicId: Int!) {
        accountByPublicId(publicId: $accountPublicId) {
          node {
            publicId
            user {
              publicId
            }
            transactions {
              edges {
                node {
                  id
                  publicId
                }
              }
            }
          }
        }
      }
    `
    const app = await main()
    const response = await supertest(app.callback())
      .query(query)
      .variables({
        accountPublicId: account?.publicId
      })
      .end()
    const { accountByPublicId } = response.data

    expect(accountByPublicId.node.transactions.edges.length === 2).toBeTruthy()
    expect((await Transaction.find()).length === 3).toBeTruthy()
  })
  it.only('should be list all accounts', async () => {
    await Promise.all([createAccount(), createAccount()])

    const query = gql`
      query ListAccounts {
        accounts {
          edges {
            node {
              publicId
              user {
                fullName
                email
                pixKey
              }
            }
          }
        }
      }
    `
    const app = await main()
    const response = await supertest(app.callback()).query(query).end()
    const { accounts, errors } = response.data

    expect(accounts.edges.length === 2).toBeTruthy()
  })
  it('should be list one account by public id', async () => {
    const account = await createAccount()

    const query = gql`
      query ListAccount($accountPublicId: Int!) {
        accountByPublicId(publicId: $accountPublicId) {
          node {
            user {
              publicId
            }
            publicId
          }
        }
      }
    `
    const app = await main()
    const response = await supertest(app.callback())
      .query(query)
      .variables({ accountPublicId: account?.publicId })
      .end()
    const { accountByPublicId } = response.data

    expect(accountByPublicId.node.publicId).toBe(account.publicId)
    expect(accountByPublicId.user).not.toBeNull()
  })
})
