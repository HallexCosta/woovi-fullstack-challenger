import type MongoMemoryServer from 'mongodb-memory-server-core'
import type mongoose from 'mongoose'

export const disconnectMemoryDb = (db: MongoMemoryServer) => db.stop()
export const disconnectMongoose = async (connection: mongoose.Mongoose) => {
  // mongoose.disconnect()
  await connection.connection.close()

  // dumb mongoose
  // for (const connection of mongoose.connections) {
  //   const modelNames = Object.keys(connection.models)

  //   // biome-ignore lint/complexity/noForEach: <explanation>
  //   modelNames.forEach((modelName) => {
  //     delete connection.models[modelName]
  //   })

  //   const collectionNames = Object.keys(connection.collections)
  //   // biome-ignore lint/complexity/noForEach: <explanation>
  //   collectionNames.forEach((collectionName) => {
  //     delete connection.collections[collectionName]
  //   })
  // }

  // if (mongoose.modelSchemas) {
  //   const modelSchemaNames = Object.keys(mongoose.modelSchemas)
  //   // biome-ignore lint/complexity/noForEach: <explanation>
  //   modelSchemaNames.forEach((modelSchemaName) => {
  //     delete mongoose.modelSchemas[modelSchemaName]
  //   })
  // }

  // mongoose.deleteModel(/.+/)
}
