import mongoose from 'mongoose'
import { vi } from 'vitest'

declare global {
  var __MONGO_URI__: string
  var __MONGO_DB_NAME__: string
}

export async function connectMongoose() {
  // const defaultMongoUri =
  //   'mongodb://localhost:27000,localhost:27001,localhost:27002?replicaSet=rs'
  return await mongoose.connect(global.__MONGO_URI__, {
    connectTimeoutMS: 10000,
    dbName: global.__MONGO_DB_NAME__
  })
}
