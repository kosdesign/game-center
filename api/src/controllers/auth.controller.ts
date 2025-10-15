import { Request, Response, NextFunction } from 'express'
import { AuthService } from '../services/auth.service'
import { ApiResponse, LoginRequest } from '@shared/types'

export class AuthController {
  private authService: AuthService

  constructor() {
    this.authService = new AuthService()
  }

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { username, password } = req.body as LoginRequest

      const result = await this.authService.login(username, password)

      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Login successful',
        timestamp: new Date().toISOString()
      }

      res.status(200).json(response)
    } catch (error: any) {
      if (error.message === 'Invalid credentials') {
        const response: ApiResponse = {
          success: false,
          error: 'Authentication Failed',
          message: error.message,
          timestamp: new Date().toISOString()
        }
        res.status(401).json(response)
      } else {
        next(error)
      }
    }
  }
}
