import { graphql } from 'relay-runtime'

export const CreatePixTransactionMutation = graphql`
  mutation CreatePixTransactionMutation($input: CreatePixTransactionInput!) {
    CreatePixTransaction(input: $input) {
      error
      success
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
