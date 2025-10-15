import { GameDetailsRepository } from '../repositories/GameDetails.repository'
import { GameParentRepository } from '../repositories/GameParent.repository'
import { VersionChangelogRepository } from '../repositories/VersionChangelog.repository'
import { GameDetails, GameType, ServerGameType } from '@shared/types'

export interface CreateVersionData {
  game_version: string
  description: string
  port_type: 'fixed' | 'range'
  port?: number
  port_start?: number
  port_end?: number
  api_url: string
  type: GameType
  match_making_url?: string
  server_game_ip: string
  server_game_type: ServerGameType
}

export class GameVersionService {
  private gameDetailsRepository: GameDetailsRepository
  private gameParentRepository: GameParentRepository
  private changelogRepository: VersionChangelogRepository

  constructor() {
    this.gameDetailsRepository = new GameDetailsRepository()
    this.gameParentRepository = new GameParentRepository()
    this.changelogRepository = new VersionChangelogRepository()
  }

  async getVersionsByGameId(gameId: string) {
    const parent = await this.gameParentRepository.findByGameId(gameId)
    if (!parent) {
      throw new Error('Game not found')
    }

    return this.gameDetailsRepository.findByGameId(gameId)
  }

  async getVersionByGameIdAndVersion(gameId: string, version: string) {
    return this.gameDetailsRepository.findByGameIdAndVersion(gameId, version)
  }

  async createVersion(gameId: string, data: CreateVersionData, changedBy: string = 'system') {
    const parent = await this.gameParentRepository.findByGameId(gameId)
    if (!parent) {
      throw new Error('Game not found')
    }

    const exists = await this.gameDetailsRepository.exists(gameId, data.game_version)
    if (exists) {
      throw new Error('Version already exists for this game')
    }

    const version = await this.gameDetailsRepository.create({
      game_id: gameId,
      ...data,
      is_active: true
    } as Partial<GameDetails>)

    await this.changelogRepository.create({
      game_id: gameId,
      game_version: data.game_version,
      change_type: 'created',
      new_values: data,
      changed_by: changedBy,
      changed_at: new Date(),
      change_description: 'Version created'
    })

    return version
  }

  async updateVersion(
    gameId: string,
    version: string,
    data: Partial<CreateVersionData>,
    changedBy: string = 'system'
  ) {
    const existing = await this.gameDetailsRepository.findByGameIdAndVersion(gameId, version)
    if (!existing) {
      throw new Error('Version not found')
    }

    const changedFields = Object.keys(data)
    const oldValues: Record<string, any> = {}
    const newValues: Record<string, any> = {}

    changedFields.forEach(field => {
      oldValues[field] = (existing as any)[field]
      newValues[field] = (data as any)[field]
    })

    const updated = await this.gameDetailsRepository.update(gameId, version, data as Partial<GameDetails>)

    await this.changelogRepository.create({
      game_id: gameId,
      game_version: version,
      change_type: 'updated',
      changed_fields: changedFields,
      old_values: oldValues,
      new_values: newValues,
      changed_by: changedBy,
      changed_at: new Date(),
      change_description: `Updated fields: ${changedFields.join(', ')}`
    })

    return updated
  }

  async deleteVersion(gameId: string, version: string, changedBy: string = 'system') {
    const existing = await this.gameDetailsRepository.findByGameIdAndVersion(gameId, version)
    if (!existing) {
      throw new Error('Version not found')
    }

    await this.changelogRepository.create({
      game_id: gameId,
      game_version: version,
      change_type: 'deleted',
      old_values: existing.toObject(),
      changed_by: changedBy,
      changed_at: new Date(),
      change_description: 'Version deleted'
    })

    return this.gameDetailsRepository.delete(gameId, version)
  }

  async getVersionChangelog(gameId: string, version: string, limit: number = 50) {
    return this.changelogRepository.findByGameIdAndVersion(gameId, version, limit)
  }

  async getGameChangelog(gameId: string, limit: number = 100) {
    return this.changelogRepository.findByGameId(gameId, limit)
  }
}
