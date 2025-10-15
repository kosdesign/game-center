import { Response, NextFunction } from 'express'
import { AuthRequest } from './auth.middleware'

export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.admin) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        timestamp: new Date().toISOString()
      })
      return
    }

    if (!allowedRoles.includes(req.admin.role)) {
      res.status(403).json({
        success: false,
        error: 'Forbidden: Insufficient permissions',
        timestamp: new Date().toISOString()
      })
      return
    }

    next()
  }
}
