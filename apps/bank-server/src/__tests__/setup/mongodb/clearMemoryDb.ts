import mongoose from 'mongoose'

import { restartCounters } from '../utils/counters/restartCounters'

export async function clearDatabase() {
  await mongoose.connection.db.dropDatabase()
}

export async function clearDbAndRestartCounters() {
  await clearDatabase()
  restartCounters()
}
