import mongoose from 'mongoose'

export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/game-center'

    await mongoose.connect(mongoUri)

    console.log('✅ MongoDB connected successfully')

    mongoose.connection.on('error', (error) => {
      console.error('MongoDB connection error:', error)
    })

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected')
    })

  } catch (error) {
    console.error('Failed to connect to MongoDB:', error)
    process.exit(1)
  }
}

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect()
    console.log('MongoDB disconnected')
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error)
  }
}
