import path from 'node:path'
import dotenvSafe from 'dotenv-safe'

const isProduction = process.env.NODE_ENV === 'production'

if (!isProduction) {
  const root = path.join.bind(process.cwd())

  dotenvSafe.config({
    path: root('.env'),
    sample: root('.env.example')
  })
}

export const config = {
  PORT: process.env.PORT!,
  MONGO_URI: process.env.MONGO_URI!,
  REDIS_HOST: process.env.REDIS_HOST!,
  JWT_SECRET: process.env.JWT_SECRET!
}
