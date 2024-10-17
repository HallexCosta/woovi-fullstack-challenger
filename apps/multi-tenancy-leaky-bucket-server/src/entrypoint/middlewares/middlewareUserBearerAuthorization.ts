import { left } from '@woovi/server-utils'
import type { GraphQLResolveInfo } from 'graphql'

type MutationFn = (
  input: any,
  ctx: any,
  info: GraphQLResolveInfo
) => Promise<unknown>

type QueryFn = (_: any, args: any, context: any) => Promise<unknown>

export const middlewareUserBearerTokenAuthorization: (
  typeMiddleware: 'query' | 'mutation',
  fn: QueryFn | MutationFn
) => QueryFn | MutationFn = (typeMiddleware, fn) => {
  return async (_, args, context) => {
    // is query function
    if (context.hasOwnProperty('buckets')) {
      if (!context.user || !context.tenant) {
        return left('User Unauthorized')
      }

      return await fn(_, args, context)
    }

    // is mutation function
    const input = _
    const mutationContext = args
    const mutationInfo = context

    if (!mutationContext.user || !mutationContext.tenant) {
      return left('User Unauthorized')
    }

    return await fn(input, mutationContext, mutationInfo)
  }
}
