import request from 'supertest-graphql'
import { describe, expect, it } from 'vitest'
import { gql } from '../../setup/utils/gql'

import { createTenant } from '@/__tests__/setup/fixtures/createTenant'
import { createUser } from '@/__tests__/setup/fixtures/createUser'
import { main } from '@/main'

describe('SignUp', () => {
  it('should be create user and account', async () => {
    const tenant = await createTenant()

    const query = gql`
      mutation SignUpMutation($input: SignUpInput!) {
        SignUp(input: $input) {
          error
          success
          userEdge {
            node {
              id
              email
              account {
                publicId
              }
            }
          }
        }
      }
    `

    const payload = {
      input: {
        email: 'hallex.costa@hotmail.com',
        pixKey: '+5500000000000',
        fullName: 'Hállex costa',
        tenantPublicId: tenant.publicId
      }
    }
    const app = await main()
    const { data, errors } = await request(app.callback())
      .query(query)
      .variables({
        input: payload.input
      })
      .end()
    console.log({ data, errors })
    const {
      SignUp: { success, error, userEdge }
    } = data

    expect(userEdge.node.email).toBe(payload.input.email)
    expect(userEdge.node.account).not.toBeNull()
    expect(success).toBe('User created successfully')
    expect(error).toBeNull()
  })

  it('should be return error message if tenant not found', async () => {
    const tenant = await createTenant()
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
        }
      }
    `

    const payload = {
      input: {
        email: 'hallex.costa@hotmail.com',
        pixKey: '+5500000000000',
        fullName: 'Hállex costa',
        tenantPublicId: 123
      }
    }
    const app = await main()
    const { data, errors } = await request(app.callback())
      .query(query)
      .variables({
        input: payload.input
      })
      .end()

    const {
      SignUp: { success, error }
    } = data

    expect(error).toBe('Tenant not found')
    expect(success).toBeNull()
  })
  it('should be return error message if pix key already in use', async () => {
    const tenant = await createTenant()
    await createUser({ tenantId: tenant.id, pixKey: '+5500000000000' })

    const query = gql`
      mutation SignUpMutation($input: SignUpInput!) {
        SignUp(input: $input) {
          error
          success
          userEdge {
            node {
              id
              email
              account {
                id
                userId
                balance
              }
            }
          }
        }
      }
    `

    const payload = {
      input: {
        email: 'hallex.costa@hotmail.com',
        pixKey: '+5500000000000',
        fullName: 'Hállex costa',
        tenantPublicId: tenant.publicId
      }
    }
    const app = await main()
    const { data, errors } = await request(app.callback())
      .query(query)
      .variables({
        input: payload.input
      })
      .end()
    console.log({ data, errors })
    const {
      SignUp: { success, error }
    } = data

    expect(error).toBe('Pix key or email already in use')
    expect(success).toBeNull()
  })

  it('should be return error message if email already in use', async () => {
    const tenant = await createTenant()
    await createUser({ email: 'hallex.costa@hotmail.com', tenantId: tenant.id })

    const query = gql`
      mutation SignUpMutation($input: SignUpInput!) {
        SignUp(input: $input) {
          error
          success
          userEdge {
            node {
              id
              email
              account {
                id
                userId
                balance
              }
            }
          }
        }
      }
    `

    const payload = {
      input: {
        email: 'hallex.costa@hotmail.com',
        pixKey: '+5500000000000',
        fullName: 'Hállex costa',
        tenantPublicId: tenant.publicId
      }
    }
    const app = await main()
    const { data, errors } = await request(app.callback())
      .query(query)
      .variables({
        input: payload.input
      })
      .end()

    console.log({ data, errors })

    const {
      SignUp: { success, error, userEdge }
    } = data

    expect(error).toBe('Pix key or email already in use')
    expect(success).toBeNull()
    expect(userEdge).toBeNull()
  })
})
