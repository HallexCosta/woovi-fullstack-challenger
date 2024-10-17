import 'module-alias/register'

import { connectDatabase } from './database'

import cors from '@koa/cors'
import logger from 'koa-logger'
import { app } from './app'
import { graphqlEntrypoint } from './entrypoint/graphql'
import { runSeeds } from './seeds'

const environmentsRunSeeds = ['production', 'development', 'prod', 'dev']

export const main = async () => {
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
  // app.listen(config.PORT, () => console.log(`started on port ${config.PORT}`))
  return app
}

// main()
