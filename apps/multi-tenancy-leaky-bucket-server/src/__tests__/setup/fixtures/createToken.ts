import { config } from '@/config'
import { TenantLoader } from '@/modules/tenant/TenantLoader'
import jwt from 'jsonwebtoken'
import { createAccount } from './createAccount'
import { createTenant } from './createTenant'
import { createUser } from './createUser'

export const createToken = async (params = {}) => {
  let tenant
  if (params?.tenant?.id) {
    tenant = await TenantLoader.load({ id: params.tenant.id })
  } else {
    tenant = await createTenant(params.tenant || {})
  }

  const user = await createUser(
    Object.assign(
      {
        email: 'hallex.costa@hotmail.com',
        pixKey: 'hallex.costa@hotmail.com',
        tenantId: tenant.id
      },
      params.user ?? {}
    )
  )
  const account = await createAccount({
    tenantId: tenant.id,
    balance: 0,
    userId: user.id
  })
  const token = jwt.sign(
    {
      userPublicId: user.publicId,
      accountPublicId: account.publicId,
      tenantPublicId: tenant.publicId
    },
    config.JWT_SECRET,
    {
      expiresIn: '1h'
    }
  )

  return {
    token,
    account,
    user,
    tenant
  }
}
