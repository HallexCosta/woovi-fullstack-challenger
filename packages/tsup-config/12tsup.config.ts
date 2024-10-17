import { loadServerConfig } from '@woovi/tsup-config/server'

export default loadServerConfig({
  entry: ['./server/index.ts']
})
