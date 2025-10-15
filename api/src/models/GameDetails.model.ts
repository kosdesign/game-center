import mongoose, { Schema, Document } from 'mongoose'
import { GameDetails as IGameDetails } from '@shared/types'

export interface GameDetailsDocument extends Omit<IGameDetails, '_id'>, Document {}

const GameDetailsSchema = new Schema<GameDetailsDocument>(
  {
    game_id: {
      type: String,
      required: true,
      ref: 'GameParent'
    },
    game_version: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    port_type: {
      type: String,
      enum: ['fixed', 'range'],
      required: true,
      default: 'fixed'
    },
    port: {
      type: Number,
      required: false
    },
    port_start: {
      type: Number,
      required: false
    },
    port_end: {
      type: Number,
      required: false
    },
    api_url: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['PROD', 'TEST', 'UAT'],
      required: true
    },
    match_making_url: {
      type: String,
      required: false
    },
    server_game_ip: {
      type: String,
      required: true
    },
    server_game_type: {
      type: String,
      enum: ['UDP', 'TCP'],
      required: true
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

GameDetailsSchema.index({ game_id: 1, game_version: 1 }, { unique: true })
GameDetailsSchema.index({ game_id: 1 })
GameDetailsSchema.index({ type: 1 })
GameDetailsSchema.index({ type: 1, is_active: 1 })
GameDetailsSchema.index({ is_active: 1 })

export const GameDetailsModel = mongoose.model<GameDetailsDocument>('GameDetails', GameDetailsSchema)
