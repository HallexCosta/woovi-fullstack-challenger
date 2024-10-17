import { getCounter } from '@/__tests__/setup/utils/counters/getCounter'
import {
  Account,
  type AccountModelDocument
} from '@/modules/account/AccountModel'
import { TenantModel } from '@/modules/tenant/TenantModel'
import { generateUniqueIntId } from '@woovi/server-utils'
import { getOrCreate } from '../utils/getOrCreate'
import { createTenant } from './createTenant'

export const createAccount = async (
  args: Partial<AccountModelDocument> = {}
) => {
  const i = getCounter('tenant')

  const props = Object.assign(
    {
      publicId: generateUniqueIntId()
    },
    args
  )

  if (!props.tenantId) {
    const tenant = await getOrCreate(TenantModel, createTenant)
    props.tenantId = tenant.id
  }

  return new Account(props).save()
}
