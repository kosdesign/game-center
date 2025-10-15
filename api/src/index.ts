import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import rateLimit from 'express-rate-limit'
import { connectDatabase } from './config/database'
import authRoutes from './routes/auth.routes'
import adminRoutes from './routes/admin.routes'
import gameRoutes from './routes/game.routes'
import gameParentRoutes from './routes/gameParent.routes'
import gameVersionRoutes from './routes/gameVersion.routes'
import openApiRoutes from './routes/openApi.routes'
import { errorHandler, notFoundHandler } from './middleware/error.middleware'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later'
})

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(limiter)

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  })
})

app.use('/api/auth', authRoutes)
app.use('/api/admin/admins', adminRoutes)
app.use('/api/game', openApiRoutes)
app.use('/api/games/parents', gameParentRoutes)
app.use('/api/games/parents', gameVersionRoutes)
app.use('/api/games', gameRoutes)

app.use(notFoundHandler)
app.use(errorHandler)

const startServer = async () => {
  try {
    await connectDatabase()

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()
