import type mongoose from 'mongoose'

import { restartCounters } from '@/__tests__/setup/utils/counters/restartCounters'
async function waitForDrop(db) {
  while (true) {
    const collections = await db.listCollections().toArray()
    if (collections.length === 0) break
    await new Promise((resolve) => setTimeout(resolve, 500)) // Atraso de 0.5 segundos
  }
}

async function clearDatabase(connection: mongoose.Mongoose) {
  const maxRetries = 10

  // console.log(await connection.connection.db.listCollections().toArray())
  // process.exit(1)
  // await waitForDrop(connection.connection.db)
  await connection.connection.db.dropDatabase({
    retryWrites: false,
    readConcern: 'majority'
  })
  // for (let i = 0; i < maxRetries; i++) {
  //   try {
  //     await connection.connection.db.dropDatabase()
  //     // console.log(await connection.connection.db.stats())
  //     console.log('Database dropped successfully.')
  //     return
  //   } catch (error) {
  //     // console.log('error', await connection.connection.db.stats())
  //     if (error.message.includes('already in the process of being dropped')) {
  //       console.log('Database is in the process of being dropped. Retrying...')
  //       await new Promise((resolve) => setTimeout(resolve, 3000)) // Wait before retrying
  //     } else {
  //       console.error('Error dropping database:', error)
  //       throw error // Throw other errors
  //     }
  //   }
  // }
}

export async function clearDbAndRestartCounters(connection: mongoose.Mongoose) {
  await clearDatabase(connection)
  restartCounters()
}
