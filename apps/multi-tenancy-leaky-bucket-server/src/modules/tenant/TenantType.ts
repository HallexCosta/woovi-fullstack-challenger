import { GraphQLInt, GraphQLObjectType, GraphQLString } from 'graphql'
import { connectionDefinitions, globalIdField } from 'graphql-relay'

import type { Tenant } from './TenantModel'

export const TenantType: GraphQLObjectType = new GraphQLObjectType({
  name: 'Tenant',
  description: 'Tenants from woovi leaky bucket',
  fields: () => ({
    id: globalIdField('tenant'),
    publicId: {
      type: GraphQLInt,
      resolve: (tenant: Tenant) => tenant.publicId
    },
    status: {
      type: GraphQLString,
      description: 'status from tenant',
      resolve: (tenant: Tenant) => tenant.status
    },
    createdAt: {
      type: GraphQLString,
      resolve: (tenant: Tenant) => new Date(tenant.createdAt).toISOString()
    },
    updatedAt: {
      type: GraphQLString,
      resolve: (tenant: Tenant) =>
        tenant.updatedAt ? new Date(tenant.updatedAt).toISOString() : null
    }
  })
})

export const { connectionType: TenantConnection, edgeType: TenantEdge } =
  connectionDefinitions({
    nodeType: TenantType,
    name: 'Tenant'
  })
