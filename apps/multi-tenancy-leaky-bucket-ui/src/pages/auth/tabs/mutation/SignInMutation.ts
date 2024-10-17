import { graphql } from 'relay-runtime'

export const SignInMutation = graphql`
  mutation SignInMutation($input: SignInInput!) {
    SignIn(input: $input) {
      token
      success
      error
    }
  }
`
