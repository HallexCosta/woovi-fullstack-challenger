import supertest from 'supertest-graphql'
import { gql } from '../utils/gql'

export const makeCreatePixTransactionMutationRequest = async (
  app: any,
  token: string,
  params?: any
) => {
  const query = gql`
   mutation CreatePixTranasction($input: CreatePixTransactionInput!) {
    CreatePixTransaction(input: $input) {
      error
      success
      pixKeyQueryRequestId
      transactionEdge {
        node {
          tenantId
          tenant {
            publicId
          }
          originUser {
            pixKey
          }
          destinationUser {
            pixKey
          }
        }
      }
    }
  }
  `

  const input = {
    pixKey: 'hallex.costa@hotmail.com',
    amount: 100
  }

  if (params) {
    Object.assign(input, params)
  }

  return await supertest(app.callback())
    .query(query)
    .variables({
      input
    })
    .set({
      authorization: `Bearer ${token}`
    })
    .end()
}
