import LeakyBucket from '@/modules/leaky-bucket/LeakyBucket'
import { buckets } from '@/modules/leaky-bucket/buckets'
import { schema } from '@/schema'
import koaPlayground from 'graphql-playground-middleware-koa'
import type Koa from 'koa'
import { graphqlHTTP } from 'koa-graphql'
import Router from 'koa-router'
import { decryptBearerToken } from './middlewares/auth'

export const graphqlEntrypoint = (app: Koa) => {
  const router = new Router()

  // for requests
  router.post(
    '/graphql',
    graphqlHTTP(async (ctx) => {
      const [data, error] = await decryptBearerToken(
        <string>ctx.headers.authorization
      )

      const context = {
        buckets,
        response: ctx.res
      }
      if (error) {
        Object.assign(context, { user: null, tenant: null })
      } else {
        Object.assign(context, data)
      }

      // use this if you need access the request object in resolver context
      // Object.assign(context, ctx)

      return {
        schema,
        context
      }
    })
  )
  // for playground
  router.get(
    '/graphql',
    koaPlayground({
      endpoint: '/graphql'
    })
  )

  // for healthcheck
  router.get('/', (ctx: Koa.Context) => {
    ctx.res.statusCode = 200
    ctx.set('Content-Type', 'application/json')
    ctx.res.end(
      JSON.stringify({
        message: 'I am alive'
      })
    )
  })

  app.use(router.routes()).use(router.allowedMethods())

  return router
}
