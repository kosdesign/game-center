import { Request, Response, NextFunction } from 'express'
import { GameParentService } from '../services/gameParent.service'
import { ApiResponse } from '@shared/types'

export class GameParentController {
  private gameParentService: GameParentService

  constructor() {
    this.gameParentService = new GameParentService()
  }

  getAllGameParents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const games = await this.gameParentService.getAllGameParents()

      const response: ApiResponse = {
        success: true,
        data: games,
        timestamp: new Date().toISOString()
      }

      res.status(200).json(response)
    } catch (error) {
      next(error)
    }
  }

  getGameParentById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params

      const game = await this.gameParentService.getGameParentById(id)

      if (!game) {
        const response: ApiResponse = {
          success: false,
          error: 'Not Found',
          message: 'Game not found',
          timestamp: new Date().toISOString()
        }
        res.status(404).json(response)
        return
      }

      const response: ApiResponse = {
        success: true,
        data: game,
        timestamp: new Date().toISOString()
      }

      res.status(200).json(response)
    } catch (error) {
      next(error)
    }
  }

  createGameParent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { game_id, game_name } = req.body

      const game = await this.gameParentService.createGameParent({ game_id, game_name })

      const response: ApiResponse = {
        success: true,
        data: game,
        message: 'Game created successfully',
        timestamp: new Date().toISOString()
      }

      res.status(201).json(response)
    } catch (error: any) {
      if (error.message === 'Game ID already exists') {
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

  updateGameParent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params
      const data = req.body

      const game = await this.gameParentService.updateGameParent(id, data)

      if (!game) {
        const response: ApiResponse = {
          success: false,
          error: 'Not Found',
          message: 'Game not found',
          timestamp: new Date().toISOString()
        }
        res.status(404).json(response)
        return
      }

      const response: ApiResponse = {
        success: true,
        data: game,
        message: 'Game updated successfully',
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

  deleteGameParent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params

      const deleted = await this.gameParentService.deleteGameParent(id)

      if (!deleted) {
        const response: ApiResponse = {
          success: false,
          error: 'Not Found',
          message: 'Game not found',
          timestamp: new Date().toISOString()
        }
        res.status(404).json(response)
        return
      }

      const response: ApiResponse = {
        success: true,
        message: 'Game deleted successfully',
        timestamp: new Date().toISOString()
      }

      res.status(200).json(response)
    } catch (error) {
      next(error)
    }
  }
}
