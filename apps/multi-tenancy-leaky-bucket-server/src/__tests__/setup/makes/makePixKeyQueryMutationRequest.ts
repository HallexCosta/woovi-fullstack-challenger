import supertest from 'supertest-graphql'
import { gql } from '../utils/gql'

export const makePixKeyQueryMutationRequest = async (
  app: any,
  token: string,
  input?: any
) => {
  if (!input) input = {}

  const query = gql`
    mutation PixKeyQuery($input: PixKeyQueryInput!) {
      PixKeyQuery(input: $input) {
        error
        success
        requestId
        bucketCurrentCapacity
        userEdge {
          node {
            id
            publicId
            email	
            pixKey
            createdAt
            tenant {
              publicId
              status	
              createdAt
            } 
            account {
              publicId
              balance
              status
              createdAt
            }
          }
        }
      }
    }
  `

  const inputParsed = {
    pixKey: 'hallex.costa@hotmail.com'
  }

  if (input) {
    Object.assign(inputParsed, input)
  }

  return await supertest(app.callback())
    .query(query)
    .variables({
      input: inputParsed
    })
    .set({
      authorization: `Bearer ${token}`
    })
    .end()
}
