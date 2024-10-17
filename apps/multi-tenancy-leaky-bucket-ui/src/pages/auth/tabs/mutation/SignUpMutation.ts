import { graphql } from 'relay-runtime'

export const SignUpMutation = graphql`
  mutation SignUpMutation($input: SignUpInput!) {
    SignUp(input: $input) {
      userEdge {
        node {
          id
          email
          pixKey
        }
      }
      error
      success
    }
  }
`
