import { getCounter } from '@/__tests__/setup/utils/counters/getCounter'
import {
  type Tenant,
  TenantModel,
  TenantStatus
} from '@/modules/tenant/TenantModel'
// import { generateUniqueIntId } from '@/common/generateUniqueIntId'
import { generateUniqueIntId } from '@woovi/server-utils'

export const createTenant = (args: Partial<Tenant> = {}) => {
  const i = getCounter('tenant')

  return new TenantModel({
    publicId: generateUniqueIntId(),
    status: TenantStatus.ACTIVED,
    createdAt: new Date(),
    updatedAT: null,
    ...args
  }).save()
}
