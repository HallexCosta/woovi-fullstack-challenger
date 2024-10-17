import { GraphQLObjectType } from 'graphql'

import { exportAccountMutation } from '@/modules/account/mutations'
import { exportBacenDictMutation } from '@/modules/bacen-dict'
import { exportTenantMutations } from '@/modules/tenant/mutation'
import { exportTransactionMutation } from '@/modules/transaction/mutations'
import { exportUserMutations } from '@/modules/user/mutation'

const description = String.raw`
  Consider all mutations with \`bacen\` prefix as simulator Dict API Bacen (external-service)
  External Service
  - Bacecn


  Project Service
  - Tenant
  - User
  - Account
  - Transaction
`

export const mutation = new GraphQLObjectType({
  name: 'Mutation',
  description,
  fields: () => ({
    ...exportTenantMutations(),
    ...exportUserMutations(),
    ...exportAccountMutation(),
    ...exportBacenDictMutation(),
    ...exportTransactionMutation()
  })
})
