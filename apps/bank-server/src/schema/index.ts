import { GraphQLSchema } from '@/modules/graphql'
import { mutation } from './types/mutation'
import { query } from './types/query'

export const schema = new GraphQLSchema({
  query,
  mutation
})
