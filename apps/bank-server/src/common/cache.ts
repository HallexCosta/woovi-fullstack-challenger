import { redis } from '@/entrypoint/cache'

export const cache = async (
  key: string,
  value: string,
  expirationSeconds?: number
) =>
  expirationSeconds
    ? await redis.set(key, value, 'EX', expirationSeconds)
    : await redis.set(key, value)

export const getCache = async (key: string) => await redis.get(key)
