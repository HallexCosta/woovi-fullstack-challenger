import mongoose from 'mongoose'

import { restartCounters } from '@/__tests__/setup/utils/counters/restartCounters'

async function clearDatabase() {
  await mongoose.connection.db.dropDatabase()
}

export async function clearDbAndRestartCounters() {
  await clearDatabase()
  restartCounters()
}
