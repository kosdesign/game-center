import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { ApiResponse } from '@shared/types'

export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body)
      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        const response: ApiResponse = {
          success: false,
          error: 'Validation Error',
          message: 'Invalid input data',
          timestamp: new Date().toISOString()
        }
        res.status(400).json({
          ...response,
          details: error.errors
        })
      } else {
        next(error)
      }
    }
  }
}
