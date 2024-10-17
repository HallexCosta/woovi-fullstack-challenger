import { AccountLoader } from '@/modules/account/AccountLoader'
import type Koa from 'koa'

export const middlewareUserToken = async (ctx: Koa.Context, next: Koa.Next) => {
  if (ctx.request.url.endsWith('graphql')) return next()

  const userId = ctx.request.header.authorization?.split(' ')[1]

  if (!userId) {
    ctx.response.body = 'Please send a auth token'
    return
  }

  const user = await AccountLoader.loadByPublicId(Number(userId))

  if (!user) {
    ctx.response.body = 'User not found'
    return
  }
  ctx.request.user = user
  return next()
}
