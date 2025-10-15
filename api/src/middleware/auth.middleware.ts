import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { ApiResponse } from '@shared/types'

export interface AuthRequest extends Request {
  admin?: {
    admin_id: string
    username: string
    role: string
  }
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    const response: ApiResponse = {
      success: false,
      error: 'Unauthorized',
      message: 'Access token is required',
      timestamp: new Date().toISOString()
    }
    res.status(401).json(response)
    return
  }

  const secret = process.env.JWT_SECRET || 'your-super-secret-key-change-this-in-production'

  try {
    const decoded = jwt.verify(token, secret) as any
    req.admin = {
      admin_id: decoded.admin_id,
      username: decoded.username,
      role: decoded.role
    }
    next()
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: 'Forbidden',
      message: 'Invalid or expired token',
      timestamp: new Date().toISOString()
    }
    res.status(403).json(response)
  }
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    const response: ApiResponse = {
      success: false,
      error: 'Unauthorized',
      message: 'Access token is required',
      timestamp: new Date().toISOString()
    }
    res.status(401).json(response)
    return
  }

  const secret = process.env.JWT_SECRET || 'your-super-secret-key-change-this-in-production'

  try {
    const decoded = jwt.verify(token, secret) as any
    req.admin = {
      admin_id: decoded.admin_id,
      username: decoded.username,
      role: decoded.role
    }
    next()
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: 'Forbidden',
      message: 'Invalid or expired token',
      timestamp: new Date().toISOString()
    }
    res.status(403).json(response)
  }
}
