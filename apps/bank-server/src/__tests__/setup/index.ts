import type MongoMemoryServer from 'mongodb-memory-server-core'
import { afterAll, beforeAll, beforeEach } from 'vitest'
import { clearDbAndRestartCounters } from './mongodb/clearDatabase'
import { connectMongoose } from './mongodb/connectMemoryDb'
import {
  disconnectMemoryDb,
  disconnectMongoose
} from './mongodb/disconnectMemoryDb'
import { startMemoryDb } from './mongodb/startMemoryDb'
import { initializerCounters } from './utils/counters/initializerCounters'

let mongod: MongoMemoryServer | null

beforeAll(async () => {
  initializerCounters()
  mongod = await startMemoryDb()
})

beforeEach(async () => {
  await connectMongoose()
  await clearDbAndRestartCounters()
})

afterAll(async () => {
  if (!mongod) return

  await disconnectMongoose()
  disconnectMemoryDb(mongod)
  mongod = null
})
