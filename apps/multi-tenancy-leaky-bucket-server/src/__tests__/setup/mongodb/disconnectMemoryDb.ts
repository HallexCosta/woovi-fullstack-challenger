import type MongoMemoryServer from 'mongodb-memory-server-core'
import mongoose from 'mongoose'

export const disconnectMemoryDb = (db: MongoMemoryServer) => db.stop()
export const disconnectMongoose = () => mongoose.disconnect()
