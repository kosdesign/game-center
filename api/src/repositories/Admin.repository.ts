import { AdminModel, AdminDocument } from '../models/Admin.model'
import { Admin } from '@shared/types'
import bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid'

export class AdminRepository {
  async findByUsername(username: string): Promise<AdminDocument | null> {
    return AdminModel.findOne({ username })
  }

  async findByEmail(email: string): Promise<AdminDocument | null> {
    return AdminModel.findOne({ email })
  }

  async findByAdminId(adminId: string): Promise<AdminDocument | null> {
    return AdminModel.findOne({ admin_id: adminId })
  }

  async findAll(): Promise<AdminDocument[]> {
    return AdminModel.find().select('-password_hash').sort({ created_at: -1 })
  }

  async create(data: Partial<Admin> & { password: string }): Promise<AdminDocument> {
    const passwordHash = await bcrypt.hash(data.password, 10)
    const admin = new AdminModel({
      admin_id: uuidv4(),
      username: data.username,
      email: data.email,
      password_hash: passwordHash,
      role: data.role || 'admin'
    })
    return admin.save()
  }

  async update(adminId: string, data: Partial<Admin>): Promise<AdminDocument | null> {
    return AdminModel.findOneAndUpdate(
      { admin_id: adminId },
      { $set: data },
      { new: true, runValidators: true }
    ).select('-password_hash')
  }

  async verifyPassword(admin: AdminDocument, password: string): Promise<boolean> {
    return bcrypt.compare(password, admin.password_hash)
  }

  async updateLastLogin(username: string): Promise<void> {
    await AdminModel.updateOne(
      { username },
      { $set: { last_login: new Date() } }
    )
  }

  async delete(adminId: string): Promise<boolean> {
    const result = await AdminModel.deleteOne({ admin_id: adminId })
    return result.deletedCount > 0
  }
}
