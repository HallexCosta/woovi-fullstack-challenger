import { gql } from '@/__tests__/setup/utils/gql'
import { describe, expect, it, vi } from 'vitest'

import { createAccount } from '@/__tests__/setup/fixtures/createAccount'
import { createTenant } from '@/__tests__/setup/fixtures/createTenant'
import { createUser } from '@/__tests__/setup/fixtures/createUser'
import { main } from '@/main'
import request from 'supertest-graphql'

describe('Sign In', () => {
  it('should be return 200 when signin in app', async () => {
    const tenant = await createTenant()
    const user = await createUser({
      email: 'hallex.costa@hotmail.com',
      tenantId: tenant.id
    })
    await createAccount({
      userId: user.id,
      tenantId: tenant.id
    })

    console.log({ user, tenant })

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
    const { data, errors } = await request(app.callback())
      .query(query)
      .variables({
        input: {
          email: user.email,
          tenantPublicId: tenant.publicId
        }
      })
      .end()

    const {
      SignIn: { error, token, success, userEdge }
    } = data
    expect(error).toBeNull()
    expect(success).toBe('User authenticated with successfully')
    expect(token).not.toBeNull()
    expect(userEdge).not.toBeNull()
  })

  it('should be return error message if the user dont has an account', async () => {
    const tenant = await createTenant()
    const { email } = await createUser({
      tenantId: tenant.id
    })

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
    const { data, errors } = await request(app.callback())
      .query(query)
      .variables({
        input: {
          email,
          tenantPublicId: tenant.publicId
        }
      })
      .end()

    const {
      SignIn: { error, token, success }
    } = data

    expect(error).toBe('Account not found')
    expect(success).toBeNull()
    expect(token).toBeNull()
  })

  it('should be return error message if tenant not ofund', async () => {
    const tenant = await createTenant()
    await createUser({
      tenantId: tenant.id
    })

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
    const { data, errors } = await request(app.callback())
      .query(query)
      .variables({
        input: {
          email: 'testing',
          tenantPublicId: 123
        }
      })
      .end()

    const {
      SignIn: { error, token, success }
    } = data
    expect(success).toBeNull()
    expect(error).toBe('Tenant not found')
    expect(token).toBeNull()
  })

  it('should be return error message if email is invalid', async () => {
    const tenant = await createTenant()
    await createUser({
      email: 'hallex.costa@hotmail.com',
      tenantId: tenant.id
    })

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
    const { data, errors } = await request(app.callback())
      .query(query)
      .variables({
        input: {
          email: 'some-email',
          tenantPublicId: tenant.publicId
        }
      })
      .end()

    const {
      SignIn: { error, token, success }
    } = data

    expect(success).toBeNull()
    expect(error).toBe('Email is invalid or not belongs this tenant')
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
    const { data, errors } = await request(app.callback())
      .query(query)
      .variables({
        input: {
          email: 'testing',
          tenantPublicId: 123
        }
      })
      .end()

    const {
      SignIn: { error, token, success, userEdge }
    } = data

    expect(token).toBeNull()
    expect(success).toBeNull()
    expect(userEdge).toBeNull()
  })
})
