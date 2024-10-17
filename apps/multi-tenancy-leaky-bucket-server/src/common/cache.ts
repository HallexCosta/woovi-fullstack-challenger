import { redis } from '@/entrypoint/cache'
import { createCache } from '@woovi/server-utils'

export const cache = createCache(redis)
