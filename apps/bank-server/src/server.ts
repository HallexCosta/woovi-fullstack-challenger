import 'module-alias/register'

// import { app } from './app'
import { config } from './config'
import { main } from './main'

console.log(config.PORT)
main().then((app) =>
  app.listen(config.PORT, () => console.log(`started on port ${config.PORT}`))
)
