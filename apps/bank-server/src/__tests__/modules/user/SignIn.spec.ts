import { gql } from '@/__tests__/setup/utils/gql'
import { describe, expect, it, vi } from 'vitest'

import { createAccount } from '@/__tests__/setup/fixtures/createAccount'
import { createUser } from '@/__tests__/setup/fixtures/createUser'
import { main } from '@/main'
import request from 'supertest-graphql'

import * as common from '@/common/generateUniqueIntId'

describe('Sign In', () => {
  it('should be return 200 when signin in app', async () => {
    const { _id, email, publicId } = await createUser()
    await createAccount({
      userId: _id
    })

    const query = gql`
      mutation SignInMutation($input: SignInInput!) {
        SignIn(input: $input) {
          token
          error
          success
          userEdge {
            node {
              publicId
            }
          }
        }
      }
    `

    const app = await main()
    const response = await request(app.callback())
      .query(query)
      .variables({
        input: {
          email
        }
      })
      .end()

    const {
      SignIn: { error, token, success, userEdge }
    } = response.data
    expect(error).toBeNull()
    expect(success).toBe('User authenticated with successfully')
    expect(token).not.toBeNull()
    expect(userEdge.node.publicId).toBe(publicId)
  })

  it('should be return error message if the user dont has an account', async () => {
    const { email } = await createUser()

    const query = gql`
      mutation SignInMutation($input: SignInInput!) {
        SignIn(input: $input) {
          token
          error
          success
        }
      }
    `

    const app = await main()
    const response = await request(app.callback())
      .query(query)
      .variables({
        input: {
          email
        }
      })
      .end()

    const {
      SignIn: { error, token, success }
    } = response.data

    expect(error).toBe('Account not found')
    expect(success).toBeNull()
    expect(token).toBeNull()
  })

  it('should be return error message if email is invalid', async () => {
    await createUser()

    const query = gql`
      mutation SignInMutation($input: SignInInput!) {
        SignIn(input: $input) {
          token
          error
          success
        }
      }
    `

    const app = await main()
    const response = await request(app.callback())
      .query(query)
      .variables({
        input: {
          email: 'testing'
        }
      })
      .end()

    const {
      SignIn: { error, token, success }
    } = response.data
    expect(success).toBeNull()
    expect(error).toBe('Email is invalid')
    expect(token).toBeNull()
  })

  it('should be return null if user not found', async () => {
    const query = gql`
      mutation SignInMutation($input: SignInInput!) {
        SignIn(input: $input) {
          token
          error
          success
          userEdge {
            node {
              publicId
            }
          }
        }
      }
    `

    const app = await main()
    const response = await request(app.callback())
      .query(query)
      .variables({
        input: {
          email: 'testing'
        }
      })
      .end()

    const {
      SignIn: { error, token, success, userEdge }
    } = response.data

    console.log(response.data)

    expect(token).toBeNull()
    expect(success).toBeNull()
    expect(userEdge).toBeNull()
  })
})
