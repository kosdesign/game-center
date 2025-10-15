import mongoose, { Schema, Document } from 'mongoose'
import { VersionChangelog as IVersionChangelog } from '@shared/types'

export interface VersionChangelogDocument extends Omit<IVersionChangelog, '_id'>, Document {}

const VersionChangelogSchema = new Schema<VersionChangelogDocument>(
  {
    game_id: {
      type: String,
      required: true,
      index: true
    },
    game_version: {
      type: String,
      required: true
    },
    change_type: {
      type: String,
      enum: ['created', 'updated', 'deleted'],
      required: true
    },
    changed_fields: [{
      type: String
    }],
    old_values: {
      type: Schema.Types.Mixed
    },
    new_values: {
      type: Schema.Types.Mixed
    },
    changed_by: {
      type: String,
      required: true
    },
    changed_at: {
      type: Date,
      default: Date.now,
      index: true
    },
    change_description: {
      type: String
    }
  },
  {
    timestamps: false
  }
)

VersionChangelogSchema.index({ game_id: 1, game_version: 1, changed_at: -1 })

export const VersionChangelogModel = mongoose.model<VersionChangelogDocument>(
  'VersionChangelog',
  VersionChangelogSchema
)
