import mongoose from 'mongoose'

import { config } from './config'

async function connectDatabase() {
  if (!mongoose.connection.readyState) {
    mongoose.connection.on('close', () =>
      console.log('Database connection closed.')
    )
    mongoose.connection.on('open', () =>
      console.log('Database connection open.')
    )
    await mongoose.connect(config.MONGO_URI)
  }
}

export { connectDatabase }
