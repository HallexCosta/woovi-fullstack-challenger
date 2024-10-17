import type { Redis } from 'ioredis'

export const createCache = (redis: Redis) => {
  return {
    cache: async (key: string, value: string, expirationSeconds?: number) =>
      expirationSeconds
        ? await redis.set(key, value, 'EX', expirationSeconds)
        : await redis.set(key, value),
    getCache: async (key: string) => await redis.get(key)
  }
}
