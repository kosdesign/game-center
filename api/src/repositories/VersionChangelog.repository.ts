import { VersionChangelogModel, VersionChangelogDocument } from '../models/VersionChangelog.model'
import { VersionChangelog } from '@shared/types'

export class VersionChangelogRepository {
  async create(data: Omit<VersionChangelog, '_id'>): Promise<VersionChangelogDocument> {
    const changelog = new VersionChangelogModel(data)
    return changelog.save()
  }

  async findByGameIdAndVersion(
    gameId: string,
    version: string,
    limit: number = 50
  ): Promise<VersionChangelogDocument[]> {
    return VersionChangelogModel
      .find({ game_id: gameId, game_version: version })
      .sort({ changed_at: -1 })
      .limit(limit)
  }

  async findByGameId(gameId: string, limit: number = 100): Promise<VersionChangelogDocument[]> {
    return VersionChangelogModel
      .find({ game_id: gameId })
      .sort({ changed_at: -1 })
      .limit(limit)
  }

  async deleteByGameId(gameId: string): Promise<number> {
    const result = await VersionChangelogModel.deleteMany({ game_id: gameId })
    return result.deletedCount
  }

  async deleteByGameIdAndVersion(gameId: string, version: string): Promise<number> {
    const result = await VersionChangelogModel.deleteMany({
      game_id: gameId,
      game_version: version
    })
    return result.deletedCount
  }
}
