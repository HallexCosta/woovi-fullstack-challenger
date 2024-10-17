import { config } from '@/config'
import { Account } from '@/modules/account/AccountModel'
import type { User } from '../UserModel'

import { TenantModel } from '@/modules/tenant/TenantModel'
import { left, right } from '@woovi/server-utils'
import jwt from 'jsonwebtoken'
import { UserLoader } from '../UserLoader'

type SignInServiceOutput = {
  token: string | null
  user: User
}

export const signInService = async (tenantPublicId: string, email: string) => {
  const tenant = await TenantModel.findOne({
    publicId: tenantPublicId
  })

  if (!tenant) {
    return left<SignInServiceOutput>('Tenant not found')
  }
  const tenantId = tenant.id

  const user = await UserLoader.load({
    email: email,
    tenantId: tenantId
  })

  if (!user) {
    return left<SignInServiceOutput>(
      'Email is invalid or not belongs this tenant'
    )
  }

  const account = await Account.findOne({
    userId: user.id,
    tenantId
  })

  if (!account) {
    return left<SignInServiceOutput>('Account not found')
  }

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

  return right<SignInServiceOutput>('User authenticated with successfully', {
    token,
    user
  })
}
