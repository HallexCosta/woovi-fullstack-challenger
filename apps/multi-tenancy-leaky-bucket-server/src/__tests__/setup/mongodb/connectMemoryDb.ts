import mongoose from 'mongoose'
import { vi } from 'vitest'

declare global {
  var __MONGO_URI__: string
  var __MONGO_DB_NAME__: string
}

export async function connectMongoose() {
  vi.setConfig({ testTimeout: 5_000 })

  return await mongoose.connect(global.__MONGO_URI__, {
    connectTimeoutMS: 10000,
    dbName: global.__MONGO_DB_NAME__
  })
}
