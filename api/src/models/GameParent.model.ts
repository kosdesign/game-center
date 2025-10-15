import mongoose, { Schema, Document } from 'mongoose'
import { GameParent as IGameParent } from '@shared/types'

export interface GameParentDocument extends Omit<IGameParent, '_id'>, Document {}

const GameParentSchema = new Schema<GameParentDocument>(
  {
    game_id: {
      type: String,
      required: true,
      unique: true
    },
    game_name: {
      type: String,
      required: true
    },
    api_token: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    is_active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  }
)

GameParentSchema.index({ is_active: 1 })

export const GameParentModel = mongoose.model<GameParentDocument>('GameParent', GameParentSchema)
