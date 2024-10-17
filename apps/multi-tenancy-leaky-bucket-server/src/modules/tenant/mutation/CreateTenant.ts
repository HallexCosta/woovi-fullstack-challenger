import { GraphQLNonNull, GraphQLString } from 'graphql'
import { mutationWithClientMutationId, toGlobalId } from 'graphql-relay'

import { outputFields } from '@/modules/graphql/outputFields'
import { generateUniqueIntId, right } from '@woovi/server-utils'
import { TenantModel, TenantStatus } from '../TenantModel'
import { TenantEdge } from '../TenantType'

export const CreateTenant = mutationWithClientMutationId({
  name: 'CreateTenant',
  inputFields: {},
  mutateAndGetPayload: async () => {
    const tenant = new TenantModel({
      publicId: generateUniqueIntId(),
      status: TenantStatus.ACTIVED
    })
    await tenant.save()

    return right('Tenant created with successfully', {
      tenant
    })
  },
  outputFields: outputFields({
    tenantEdge: {
      type: TenantEdge,
      resolve: ({ tenant }) => {
        if (!tenant) return null

        return {
          cursor: toGlobalId('Tenant', tenant.id),
          node: tenant
        }
      }
    }
  })
})
