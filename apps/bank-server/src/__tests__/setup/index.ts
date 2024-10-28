import type MongoMemoryServer from 'mongodb-memory-server-core'
import type mongoose from 'mongoose'
import { afterAll, afterEach, beforeAll, beforeEach, vi } from 'vitest'
import { clearDbAndRestartCounters } from './mongodb/clearDatabase'
import { connectMongoose } from './mongodb/connectMemoryDb'
import { disconnectMongoose } from './mongodb/disconnectMemoryDb'
import { startMemoryDb } from './mongodb/startMemoryDb'
import { initializerCounters } from './utils/counters/initializerCounters'

// import 'run-rs'

let mongod: MongoMemoryServer | null
let connection: mongoose.Mongoose

const connectionts = new Map()

vi.setConfig({ testTimeout: 50000 })

beforeAll(async () => {
  initializerCounters()
  mongod = await startMemoryDb()
  // await
})

beforeEach(async () => {
  connection = await connectMongoose()
  await clearDbAndRestartCounters(connection)
})

afterEach(async () => {
  console.log('after executado')

  await disconnectMongoose(connection)
})

afterAll(() => {
  if (!mongod) return

  mongod.stop()
  mongod = null
})
