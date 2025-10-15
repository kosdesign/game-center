import mongoose, { Schema, Document } from 'mongoose'
import { Admin as IAdmin } from '@shared/types'

export interface AdminDocument extends Omit<IAdmin, '_id'>, Document {}

const AdminSchema = new Schema<AdminDocument>(
  {
    admin_id: {
      type: String,
      required: true,
      unique: true
    },
    username: {
      type: String,
      required: true,
      unique: true
    },
    password_hash: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    role: {
      type: String,
      required: true,
      default: 'admin'
    },
    last_login: {
      type: Date
    }
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  }
)

export const AdminModel = mongoose.model<AdminDocument>('Admin', AdminSchema)
