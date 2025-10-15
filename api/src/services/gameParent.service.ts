import { GameParentRepository } from '../repositories/GameParent.repository'
import { GameDetailsRepository } from '../repositories/GameDetails.repository'
import { generateApiToken } from '../utils/tokenGenerator'

export class GameParentService {
  private gameParentRepository: GameParentRepository
  private gameDetailsRepository: GameDetailsRepository

  constructor() {
    this.gameParentRepository = new GameParentRepository()
    this.gameDetailsRepository = new GameDetailsRepository()
  }

  async getAllGameParents() {
    return this.gameParentRepository.findAll(true)
  }

  async getGameParentById(gameId: string) {
    return this.gameParentRepository.findByGameId(gameId)
  }

  async createGameParent(data: { game_id: string; game_name: string }) {
    const exists = await this.gameParentRepository.exists(data.game_id)
    if (exists) {
      throw new Error('Game ID already exists')
    }

    const apiToken = generateApiToken(data.game_id)

    return this.gameParentRepository.create({
      game_id: data.game_id,
      game_name: data.game_name,
      api_token: apiToken,
      is_active: true
    })
  }

  async updateGameParent(gameId: string, data: { game_name?: string; is_active?: boolean }) {
    const game = await this.gameParentRepository.findByGameId(gameId)
    if (!game) {
      throw new Error('Game not found')
    }

    return this.gameParentRepository.update(gameId, data)
  }

  async deleteGameParent(gameId: string) {
    await this.gameDetailsRepository.deleteAllByGameId(gameId)
    return this.gameParentRepository.delete(gameId)
  }
}
