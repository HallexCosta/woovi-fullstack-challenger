// import 'module-alias/register.js'

// import { app } from './app'
import { config } from './config'
import { main } from './main'

main().then((app) =>
  app.listen(config.PORT, () => console.log(`started on port ${config.PORT}`))
)
