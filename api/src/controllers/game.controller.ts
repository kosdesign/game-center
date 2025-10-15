import { Request, Response, NextFunction } from 'express'
import { GameService } from '../services/game.service'
import { ApiResponse, CreateGameRequest, UpdateGameRequest, GameType } from '@shared/types'

export class GameController {
  private gameService: GameService

  constructor() {
    this.gameService = new GameService()
  }

  createGame = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = req.body as CreateGameRequest

      const game = await this.gameService.createGame(data)

      const response: ApiResponse = {
        success: true,
        data: game,
        message: 'Game created successfully',
        timestamp: new Date().toISOString()
      }

      res.status(201).json(response)
    } catch (error: any) {
      if (error.message === 'Game version already exists') {
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

  getGameById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params

      const game = await this.gameService.getGameById(id)

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

  getAllGames = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { type } = req.query

      const games = await this.gameService.getAllGames(type as GameType)

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

  updateGame = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params
      const { version } = req.query
      const data = req.body as UpdateGameRequest

      if (!version) {
        const response: ApiResponse = {
          success: false,
          error: 'Bad Request',
          message: 'Version query parameter is required',
          timestamp: new Date().toISOString()
        }
        res.status(400).json(response)
        return
      }

      const game = await this.gameService.updateGame(id, version as string, data)

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
    } catch (error) {
      next(error)
    }
  }

  deleteGame = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params

      const deleted = await this.gameService.deleteGame(id)

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
