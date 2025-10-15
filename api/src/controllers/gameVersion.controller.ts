import { Response, NextFunction } from 'express'
import { GameVersionService } from '../services/gameVersion.service'
import { ApiResponse } from '@shared/types'
import { AuthRequest } from '../middleware/auth.middleware'

export class GameVersionController {
  private gameVersionService: GameVersionService

  constructor() {
    this.gameVersionService = new GameVersionService()
  }

  getVersionsByGameId = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { gameId } = req.params

      const versions = await this.gameVersionService.getVersionsByGameId(gameId)

      const response: ApiResponse = {
        success: true,
        data: versions,
        timestamp: new Date().toISOString()
      }

      res.status(200).json(response)
    } catch (error: any) {
      if (error.message === 'Game not found') {
        const response: ApiResponse = {
          success: false,
          error: 'Not Found',
          message: error.message,
          timestamp: new Date().toISOString()
        }
        res.status(404).json(response)
      } else {
        next(error)
      }
    }
  }

  createVersion = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { gameId } = req.params
      const data = req.body
      const changedBy = req.admin?.username || 'system'

      const version = await this.gameVersionService.createVersion(gameId, data, changedBy)

      const response: ApiResponse = {
        success: true,
        data: version,
        message: 'Version created successfully',
        timestamp: new Date().toISOString()
      }

      res.status(201).json(response)
    } catch (error: any) {
      if (error.message === 'Game not found') {
        const response: ApiResponse = {
          success: false,
          error: 'Not Found',
          message: error.message,
          timestamp: new Date().toISOString()
        }
        res.status(404).json(response)
      } else if (error.message === 'Version already exists for this game') {
        const response: ApiResponse = {
          success: false,
          error: 'Conflict',
          message: error.message,
          timestamp: new Date().toISOString()
        }
        res.status(409).json(response)
      } else {
        next(error)
      }
    }
  }

  updateVersion = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { gameId, version } = req.params
      const data = req.body
      const changedBy = req.admin?.username || 'system'

      const updatedVersion = await this.gameVersionService.updateVersion(gameId, version, data, changedBy)

      const response: ApiResponse = {
        success: true,
        data: updatedVersion,
        message: 'Version updated successfully',
        timestamp: new Date().toISOString()
      }

      res.status(200).json(response)
    } catch (error: any) {
      if (error.message === 'Version not found') {
        const response: ApiResponse = {
          success: false,
          error: 'Not Found',
          message: error.message,
          timestamp: new Date().toISOString()
        }
        res.status(404).json(response)
      } else {
        next(error)
      }
    }
  }

  deleteVersion = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { gameId, version } = req.params
      const changedBy = req.admin?.username || 'system'

      const deleted = await this.gameVersionService.deleteVersion(gameId, version, changedBy)

      if (!deleted) {
        const response: ApiResponse = {
          success: false,
          error: 'Not Found',
          message: 'Version not found',
          timestamp: new Date().toISOString()
        }
        res.status(404).json(response)
        return
      }

      const response: ApiResponse = {
        success: true,
        message: 'Version deleted successfully',
        timestamp: new Date().toISOString()
      }

      res.status(200).json(response)
    } catch (error: any) {
      if (error.message === 'Version not found') {
        const response: ApiResponse = {
          success: false,
          error: 'Not Found',
          message: error.message,
          timestamp: new Date().toISOString()
        }
        res.status(404).json(response)
      } else {
        next(error)
      }
    }
  }

  getVersionChangelog = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { gameId, version } = req.params
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50

      const changelog = await this.gameVersionService.getVersionChangelog(gameId, version, limit)

      const response: ApiResponse = {
        success: true,
        data: changelog,
        timestamp: new Date().toISOString()
      }

      res.status(200).json(response)
    } catch (error) {
      next(error)
    }
  }

  getGameChangelog = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { gameId } = req.params
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100

      const changelog = await this.gameVersionService.getGameChangelog(gameId, limit)

      const response: ApiResponse = {
        success: true,
        data: changelog,
        timestamp: new Date().toISOString()
      }

      res.status(200).json(response)
    } catch (error) {
      next(error)
    }
  }
}
