import { GameParentRepository } from '../repositories/GameParent.repository'
import { GameDetailsRepository } from '../repositories/GameDetails.repository'
import { CreateGameRequest, UpdateGameRequest, Game, GameType } from '@shared/types'

export class GameService {
  private gameParentRepository: GameParentRepository
  private gameDetailsRepository: GameDetailsRepository

  constructor() {
    this.gameParentRepository = new GameParentRepository()
    this.gameDetailsRepository = new GameDetailsRepository()
  }

  async createGame(data: CreateGameRequest): Promise<Game> {
    const parentExists = await this.gameParentRepository.exists(data.game_id)

    if (!parentExists) {
      await this.gameParentRepository.create({
        game_id: data.game_id,
        game_name: data.game_name,
        is_active: true
      })
    }

    const detailsExists = await this.gameDetailsRepository.exists(data.game_id, data.game_version)
    if (detailsExists) {
      throw new Error('Game version already exists')
    }

    const details = await this.gameDetailsRepository.create({
      game_id: data.game_id,
      game_version: data.game_version,
      description: data.description,
      port: data.port,
      api_url: data.api_url,
      type: data.type,
      match_making_url: data.match_making_url,
      server_game_ip: data.server_game_ip,
      server_game_type: data.server_game_type,
      is_active: true
    })

    const parent = await this.gameParentRepository.findByGameId(data.game_id)

    return {
      game_id: parent!.game_id,
      game_name: parent!.game_name,
      api_token: parent!.api_token,
      is_active: parent!.is_active,
      created_at: parent!.created_at,
      updated_at: parent!.updated_at,
      game_version: details.game_version,
      description: details.description,
      port_type: details.port_type,
      port: details.port,
      port_start: details.port_start,
      port_end: details.port_end,
      api_url: details.api_url,
      type: details.type,
      match_making_url: details.match_making_url,
      server_game_ip: details.server_game_ip,
      server_game_type: details.server_game_type
    }
  }

  async getGameById(gameId: string): Promise<Game | null> {
    const parent = await this.gameParentRepository.findByGameId(gameId)
    if (!parent) return null

    const detailsList = await this.gameDetailsRepository.findByGameId(gameId)
    if (detailsList.length === 0) return null

    const details = detailsList[0]

    return {
      game_id: parent.game_id,
      game_name: parent.game_name,
      api_token: parent.api_token,
      is_active: parent.is_active,
      created_at: parent.created_at,
      updated_at: parent.updated_at,
      game_version: details.game_version,
      description: details.description,
      port_type: details.port_type,
      port: details.port,
      port_start: details.port_start,
      port_end: details.port_end,
      api_url: details.api_url,
      type: details.type,
      match_making_url: details.match_making_url,
      server_game_ip: details.server_game_ip,
      server_game_type: details.server_game_type
    }
  }

  async getAllGames(type?: GameType): Promise<Game[]> {
    const detailsList = await this.gameDetailsRepository.findAll({ type, is_active: true })
    const games: Game[] = []

    for (const details of detailsList) {
      const parent = await this.gameParentRepository.findByGameId(details.game_id)
      if (parent && parent.is_active) {
        games.push({
          game_id: parent.game_id,
          game_name: parent.game_name,
          api_token: parent.api_token,
          is_active: parent.is_active,
          created_at: parent.created_at,
          updated_at: parent.updated_at,
          game_version: details.game_version,
          description: details.description,
          port_type: details.port_type,
          port: details.port,
          port_start: details.port_start,
          port_end: details.port_end,
          api_url: details.api_url,
          type: details.type,
          match_making_url: details.match_making_url,
          server_game_ip: details.server_game_ip,
          server_game_type: details.server_game_type
        })
      }
    }

    return games
  }

  async updateGame(gameId: string, version: string, data: UpdateGameRequest): Promise<Game | null> {
    if (data.game_name) {
      await this.gameParentRepository.update(gameId, { game_name: data.game_name })
    }

    const updateData: any = {}
    if (data.game_version) updateData.game_version = data.game_version
    if (data.description) updateData.description = data.description
    if (data.port) updateData.port = data.port
    if (data.api_url) updateData.api_url = data.api_url
    if (data.type) updateData.type = data.type
    if (data.match_making_url) updateData.match_making_url = data.match_making_url
    if (data.server_game_ip) updateData.server_game_ip = data.server_game_ip
    if (data.server_game_type) updateData.server_game_type = data.server_game_type
    if (data.is_active !== undefined) updateData.is_active = data.is_active

    await this.gameDetailsRepository.update(gameId, version, updateData)

    return this.getGameById(gameId)
  }

  async deleteGame(gameId: string): Promise<boolean> {
    await this.gameDetailsRepository.deleteAllByGameId(gameId)
    return this.gameParentRepository.delete(gameId)
  }
}
