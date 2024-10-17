import koaPlayground from 'graphql-playground-middleware-koa'
import type Koa from 'koa'
import { graphqlHTTP } from 'koa-graphql'
import Router from 'koa-router'
import { schema } from '../schema'
import { middlewareUserToken } from './middlewares/auth'

export const graphqlEntrypoint = (app: Koa) => {
  const router = new Router()

  // router.use(middlewareUserToken)

  // for requests
  router.post(
    '/graphql',
    graphqlHTTP({
      schema
    })
  )
  // for playground
  router.get(
    '/graphql',
    koaPlayground({
      endpoint: '/graphql'
    })
  )

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
