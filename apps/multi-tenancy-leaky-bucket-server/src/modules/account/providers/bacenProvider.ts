import { gql } from '@/__tests__/setup/utils/gql'
import { createPromiseWithResolvers } from '@/common/createPromiseWithResolvers'
import fetch from 'node-fetch'

const simulateRequestToBacenDictKeyCheck = async (pixKey: string) => {
  const query = gql`
    mutation BacenPixKeyQuery($input: BacenPixKeyQueryInput!) {
      BacenPixKeyQuery(input: $input) {
        error
        success
        e2eid
        accountEdge {
          node {
            id
            publicId
          }
        }
      }
    }
  `
  const variables = {
    input: {
      key: pixKey
    }
  }
  const payload = { query, variables }

  const { promise, resolve } = createPromiseWithResolvers()

  await fetch('http://localhost:3333/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })
    .then((response) => response.json())
    .then((data) => resolve(data))
    .catch((error) => resolve(error))

  return promise
}

export const bacenProvider = {
  dictKeyCheck: simulateRequestToBacenDictKeyCheck
}
