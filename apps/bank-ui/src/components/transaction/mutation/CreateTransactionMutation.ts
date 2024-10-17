import { graphql } from 'relay-runtime'

export const CreateTransactionMutation = graphql`
  mutation CreateTransactionMutation($connections: [ID!]!, $input: CreateTransactionInput!) {
    CreateTransaction(input: $input) {
      error
      success
      transactionEdge @prependEdge(connections: $connections) {
        node {
          id
          publicId
          amount
          originSenderAccount {
            publicId
            user {
              fullName
              profileImage
              pixKey
              publicId
              email
              createdAt
            }
          }
          destinationReceiverAccount {
            publicId
            user {
              fullName
              profileImage
              pixKey
              publicId
              email
              createdAt
            }
          }
          createdAt
          status
          type
        }
      }
    }
  }
`
