import { URL } from 'node:url'
import { config } from '@/config'
import Redis from 'ioredis'

const url = new URL(config.REDIS_HOST)

export const redis = new Redis({
  host: url.hostname,
  username: url.username,
  password: url.password,
  port: Number(url.port),
  family: 0
})
