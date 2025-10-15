import { GameDetailsModel, GameDetailsDocument } from '../models/GameDetails.model'
import { GameDetails, GameType } from '@shared/types'

export class GameDetailsRepository {
  async findById(id: string): Promise<GameDetailsDocument | null> {
    return GameDetailsModel.findById(id)
  }

  async findByGameId(gameId: string): Promise<GameDetailsDocument[]> {
    return GameDetailsModel.find({ game_id: gameId })
  }

  async findByGameIdAndVersion(gameId: string, version: string): Promise<GameDetailsDocument | null> {
    return GameDetailsModel.findOne({ game_id: gameId, game_version: version })
  }

  async findByGameIdVersionAndType(gameId: string, version: string, type: GameType): Promise<GameDetailsDocument | null> {
    return GameDetailsModel.findOne({ game_id: gameId, game_version: version, type })
  }

  async findAll(filters?: { type?: GameType; is_active?: boolean }): Promise<GameDetailsDocument[]> {
    const query: any = {}
    if (filters?.type) query.type = filters.type
    if (filters?.is_active !== undefined) query.is_active = filters.is_active
    return GameDetailsModel.find(query)
  }

  async create(data: Partial<GameDetails>): Promise<GameDetailsDocument> {
    const gameDetails = new GameDetailsModel(data)
    return gameDetails.save()
  }

  async update(
    gameId: string,
    version: string,
    data: Partial<GameDetails>
  ): Promise<GameDetailsDocument | null> {
    return GameDetailsModel.findOneAndUpdate(
      { game_id: gameId, game_version: version },
      { $set: data },
      { new: true, runValidators: true }
    )
  }

  async delete(gameId: string, version: string): Promise<boolean> {
    const result = await GameDetailsModel.deleteOne({ game_id: gameId, game_version: version })
    return result.deletedCount > 0
  }

  async deleteAllByGameId(gameId: string): Promise<number> {
    const result = await GameDetailsModel.deleteMany({ game_id: gameId })
    return result.deletedCount
  }

  async exists(gameId: string, version: string): Promise<boolean> {
    const count = await GameDetailsModel.countDocuments({ game_id: gameId, game_version: version })
    return count > 0
  }

  async setActive(gameId: string, version: string, isActive: boolean): Promise<GameDetailsDocument | null> {
    return this.update(gameId, version, { is_active: isActive })
  }
}
