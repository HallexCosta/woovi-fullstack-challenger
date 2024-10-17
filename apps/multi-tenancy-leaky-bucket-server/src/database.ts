import mongoose from 'mongoose'

import { config } from './config'

async function connectDatabase() {
  mongoose.connection.on('close', () =>
    console.log('Database connection closed.')
  )
  mongoose.connection.on('open', () => console.log('Database connection open.'))

  if (!mongoose.connection.readyState) await mongoose.connect(config.MONGO_URI)
}

export { connectDatabase }
