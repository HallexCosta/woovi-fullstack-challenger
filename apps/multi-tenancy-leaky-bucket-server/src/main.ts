// import 'module-alias/register'

import { connectDatabase } from './database'

import cors from '@koa/cors'
import logger from 'koa-logger'
import { app } from './app'
import { graphqlEntrypoint } from './entrypoint/graphql'
import { buckets } from './modules/leaky-bucket/buckets'
import { runSeeds } from './seeds'

const environmentsRunSeeds = ['production', 'development', 'prod', 'dev']
export const main = async () => {
  buckets.clear()
  await connectDatabase()

  if (environmentsRunSeeds.includes(process.env.NODE_ENV!)) {
    await runSeeds()
  }

  app.use(
    cors({
      origin: '*'
    })
  )
  app.use(logger())

  graphqlEntrypoint(app)
  return app
}
