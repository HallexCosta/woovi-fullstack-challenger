import { GraphQLObjectType } from '@/modules/graphql'

import { CreateTransaction } from '@/modules/transaction/mutations'
import { exportUserMutations } from '@/modules/user/mutation'

// console.log({ SignUp })
export const mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    CreateTransaction,
    // SignUp
    ...exportUserMutations()
  })
})
