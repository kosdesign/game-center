import { Request, Response, NextFunction } from 'express'
import { GameDetailsRepository } from '../repositories/GameDetails.repository'
import { GameParentRepository } from '../repositories/GameParent.repository'
import { extractGameIdFromToken } from '../utils/tokenGenerator'
import { ApiResponse } from '@shared/types'

export class OpenApiController {
  private gameDetailsRepository: GameDetailsRepository
  private gameParentRepository: GameParentRepository

  constructor() {
    this.gameDetailsRepository = new GameDetailsRepository()
    this.gameParentRepository = new GameParentRepository()
  }

  getGameInfo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { version_id } = req.body
      const authHeader = req.headers['authorization'] as string

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        const response: ApiResponse = {
          success: false,
          error: 'Unauthorized',
          message: 'Bearer token is required',
          timestamp: new Date().toISOString()
        }
        res.status(401).json(response)
        return
      }

      const apiToken = authHeader.substring(7)

      if (!version_id) {
        const response: ApiResponse = {
          success: false,
          error: 'Bad Request',
          message: 'version_id is required',
          timestamp: new Date().toISOString()
        }
        res.status(400).json(response)
        return
      }

      const gameIdFromToken = extractGameIdFromToken(apiToken)

      if (!gameIdFromToken) {
        const response: ApiResponse = {
          success: false,
          error: 'Unauthorized',
          message: 'Invalid token format',
          timestamp: new Date().toISOString()
        }
        res.status(401).json(response)
        return
      }

      const version = await this.gameDetailsRepository.findByGameIdAndVersion(
        gameIdFromToken,
        version_id
      )

      if (!version) {
        const response: ApiResponse = {
          success: false,
          error: 'Not Found',
          message: 'Version not found',
          timestamp: new Date().toISOString()
        }
        res.status(404).json(response)
        return
      }

      const game = await this.gameParentRepository.findByGameId(version.game_id)

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

      if (game.api_token !== apiToken) {
        const response: ApiResponse = {
          success: false,
          error: 'Forbidden',
          message: 'Invalid API token for this game',
          timestamp: new Date().toISOString()
        }
        res.status(403).json(response)
        return
      }

      const response: ApiResponse = {
        success: true,
        data: {
          version_id: version._id,
          game_id: version.game_id,
          game_version: version.game_version,
          description: version.description,
          port_type: version.port_type,
          port: version.port,
          port_start: version.port_start,
          port_end: version.port_end,
          api_url: version.api_url,
          type: version.type,
          match_making_url: version.match_making_url,
          server_game_ip: version.server_game_ip,
          server_game_type: version.server_game_type,
          is_active: version.is_active,
          created_at: version.created_at,
          updated_at: version.updated_at
        },
        timestamp: new Date().toISOString()
      }

      res.status(200).json(response)
    } catch (error) {
      next(error)
    }
  }
}
