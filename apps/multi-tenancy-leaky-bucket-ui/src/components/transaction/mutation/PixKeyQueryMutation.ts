import { graphql } from 'relay-runtime'

export const PixKeyQueryMutation = graphql`
  mutation PixKeyQueryMutation($input: PixKeyQueryInput!) {
    PixKeyQuery(input: $input) {
      error
      success
      bucketTokensConsumePixKeyInvalid
      bucketCapacity
      bucketCurrentCapacity
      requestId
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
