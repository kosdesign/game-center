import { Request, Response, NextFunction } from 'express'
import { ErrorResponse } from '@shared/types'

export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error:', error)

  const statusCode = res.statusCode !== 200 ? res.statusCode : 500

  const response: ErrorResponse = {
    success: false,
    error: error.name || 'Internal Server Error',
    message: error.message || 'An unexpected error occurred',
    code: String(statusCode),
    timestamp: new Date().toISOString()
  }

  if (process.env.NODE_ENV === 'development') {
    response.details = {
      stack: error.stack
    }
  }

  res.status(statusCode).json(response)
}

export const notFoundHandler = (req: Request, res: Response): void => {
  const response: ErrorResponse = {
    success: false,
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    code: '404',
    timestamp: new Date().toISOString()
  }
  res.status(404).json(response)
}
