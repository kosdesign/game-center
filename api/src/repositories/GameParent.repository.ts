import { GameParentModel, GameParentDocument } from '../models/GameParent.model'
import { GameParent } from '@shared/types'

export class GameParentRepository {
  async findByGameId(gameId: string): Promise<GameParentDocument | null> {
    return GameParentModel.findOne({ game_id: gameId })
  }

  async findAll(isActive?: boolean): Promise<GameParentDocument[]> {
    const filter = isActive !== undefined ? { is_active: isActive } : {}
    return GameParentModel.find(filter)
  }

  async create(data: Partial<GameParent>): Promise<GameParentDocument> {
    const gameParent = new GameParentModel(data)
    return gameParent.save()
  }

  async update(gameId: string, data: Partial<GameParent>): Promise<GameParentDocument | null> {
    return GameParentModel.findOneAndUpdate(
      { game_id: gameId },
      { $set: data },
      { new: true, runValidators: true }
    )
  }

  async delete(gameId: string): Promise<boolean> {
    const result = await GameParentModel.deleteOne({ game_id: gameId })
    return result.deletedCount > 0
  }

  async exists(gameId: string): Promise<boolean> {
    const count = await GameParentModel.countDocuments({ game_id: gameId })
    return count > 0
  }

  async setActive(gameId: string, isActive: boolean): Promise<GameParentDocument | null> {
    return this.update(gameId, { is_active: isActive })
  }
}
