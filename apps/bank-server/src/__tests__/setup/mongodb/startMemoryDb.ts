import { randomUUID } from 'node:crypto'
import { MongoMemoryReplSet, MongoMemoryServer } from 'mongodb-memory-server'

let replSet: MongoMemoryReplSet = null

export const startMemoryDb = async () => {
  // const mongod = await MongoMemoryServer.create({
  //   instance: {
  //     // settings here
  //     // dbName is null, so it's random
  //     // dbName: MONGO_DB_NAME,
  //   },
  //   binary: {
  //     version: '4.0.5'
  //   }
  //   // debug: true,
  //   // autoStart: false,
  // })

  const name = randomUUID()
  if (!replSet) {
    replSet = await MongoMemoryReplSet.create({
      replSet: { count: 3, name, storageEngine: 'wiredTiger' },
      binary: {
        version: '4.0.12'
      }
    }) // This will create an ReplSet with 3 members
    await replSet.waitUntilRunning()
  }
  global.__MONGO_URI__ = replSet.getUri()
  console.log(name, global.__MONGO_URI__)

  return replSet
}
