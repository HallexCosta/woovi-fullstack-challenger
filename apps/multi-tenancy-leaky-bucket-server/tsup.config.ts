import { loadServerConfig } from '@woovi/tsup-config'

// export default server

import path from 'node:path'
const entryDir = path.resolve(process.cwd(), 'src', 'server.ts')

export default loadServerConfig([entryDir])
