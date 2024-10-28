import { config } from '@/config'
import { Account } from '@/modules/account/AccountModel'
import { type User, UserModel } from '../UserModel'

import { left, right } from '@/common/either'
import jwt from 'jsonwebtoken'

type SignInServiceOutput = {
  token: string | null
  user: User
}

export const signInService = async (email: string) => {
  const user = await UserModel.findOne({
    email
  })

  console.log({ email, user })
  if (!user) {
    return left<SignInServiceOutput>('Email is invalid')
  }

  const account = await Account.findOne({
    userId: user.id
  })
  if (!account) {
    return left<SignInServiceOutput>('Account not found')
  }

  const token = jwt.sign(
    {
      userCreatedAt: user.createdAt,
      publicId: user.publicId,
      accountPublicId: account.publicId
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
