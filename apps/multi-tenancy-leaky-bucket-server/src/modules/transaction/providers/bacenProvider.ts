import { gql } from '@/__tests__/setup/utils/gql'
import { createPromiseWithResolvers } from '@/common/createPromiseWithResolvers'
import fetch from 'node-fetch'

const simulateRequestToBacenCreatePixTransaction = async (
  originPixKey: string,
  destinationPixKey: string,
  amount: number
) => {
  const query = gql`
    mutation BacenCreatePixTransaction($input: BacenCreatePixTransactionInput!) {
      BacenCreatePixTransaction(input: $input) {
        error
        success
        transactionEdge {
          node {
            id
            e2eid
            originPixKey
            destinationPixKey
            createdAt
            account {
              balance
              createdAt
            }
          }
        }
      }
    }
  `
  const variables = {
    input: {
      destinationPixKey,
      originPixKey,
      amount
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
  createPixTransaction: simulateRequestToBacenCreatePixTransaction
}
