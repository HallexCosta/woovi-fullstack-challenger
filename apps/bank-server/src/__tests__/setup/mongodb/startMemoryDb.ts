import { MongoMemoryServer } from 'mongodb-memory-server'

export const startMemoryDb = async () => {
  const mongod = await MongoMemoryServer.create({
    instance: {
      // settings here
      // dbName is null, so it's random
      // dbName: MONGO_DB_NAME,
    },
    binary: {
      version: '4.0.5'
    }
    // debug: true,
    // autoStart: false,
  })

  global.__MONGO_URI__ = mongod.getUri()

  console.log(global.__MONGO_URI__)

  return mongod
}
