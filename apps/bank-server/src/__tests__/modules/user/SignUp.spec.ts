import request from 'supertest-graphql'
import { beforeEach, describe, expect, it } from 'vitest'
import { gql } from '../../setup/utils/gql'

import { createUser } from '@/__tests__/setup/fixtures/createUser'
import { clearDbAndRestartCounters } from '@/__tests__/setup/mongodb/clearDatabase'
import { main } from '@/main'

describe('SignUp', () => {
  it('should be create user and account with balance 100.000 when sign-up in app', async () => {
    const query = gql`
      mutation SignUpMutation($input: SignUpInput!) {
        SignUp(input: $input) {
          error
          success
          userEdge {
            node {
              id
              email
            }
          }
          accountEdge {
            node {
              id
              userId
              balance
            }
          }
        }
      }
    `

    const payload = {
      input: {
        email: 'hallex.costa@hotmail.com',
        pixKey: '+5500000000000',
        fullName: 'Hállex costa'
      }
    }
    const app = await main()
    const response = await request(app.callback())
      .query(query)
      .variables({
        input: payload.input
      })
      .end()

    console.log({ response: response.data })
    const {
      SignUp: { success, error, userEdge, accountEdge }
    } = response.data

    expect(userEdge.node.email).toBe(payload.input.email)
    expect(success).toBe('User created successfully')
    expect(error).toBeNull()

    expect(accountEdge).not.toBeNull()
    expect(accountEdge.node.balance).toBe(100 * 1000)
  })
  it('should be return error message if pix key already in use', async () => {
    await createUser({ pixKey: '+5500000000000' })

    const query = gql`
      mutation SignUpMutation($input: SignUpInput!) {
        SignUp(input: $input) {
          error
          success
          userEdge {
            node {
              id
              email
            }
          }
          accountEdge {
            node {
              id
              userId
              balance
            }
          }
        }
      }
    `

    const payload = {
      input: {
        email: 'hallex.costa@hotmail.com',
        pixKey: '+5500000000000',
        fullName: 'Hállex costa'
      }
    }
    const app = await main()
    const response = await request(app.callback())
      .query(query)
      .variables({
        input: payload.input
      })
      .end()
    const {
      SignUp: { success, error, userEdge, accountEdge }
    } = response.data

    expect(error).toBe('Pix key or email already in use')
    expect(success).toBeNull()
  })

  it('should be return error message if email already in use', async () => {
    await createUser({ email: 'hallex.costa@hotmail.com' })

    const query = gql`
      mutation SignUpMutation($input: SignUpInput!) {
        SignUp(input: $input) {
          error
          success
          userEdge {
            node {
              id
              email
            }
          }
          accountEdge {
            node {
              id
              userId
              balance
            }
          }
        }
      }
    `

    const payload = {
      input: {
        email: 'hallex.costa@hotmail.com',
        pixKey: '+5500000000000',
        fullName: 'Hállex costa'
      }
    }
    const app = await main()
    const response = await request(app.callback())
      .query(query)
      .variables({
        input: payload.input
      })
      .end()
    const {
      SignUp: { success, error, userEdge, accountEdge }
    } = response.data

    expect(error).toBe('Pix key or email already in use')
    expect(success).toBeNull()
    expect(userEdge).toBeNull()
  })
})
