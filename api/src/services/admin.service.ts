import { AdminRepository } from '../repositories/Admin.repository'
import { CreateAdminInput, UpdateAdminInput } from '@shared/types'

export interface AdminResponse {
  admin_id: string
  username: string
  email: string
  role: string
  created_at: Date
  last_login?: Date
}

export class AdminService {
  private adminRepository: AdminRepository

  constructor() {
    this.adminRepository = new AdminRepository()
  }

  async createAdmin(data: CreateAdminInput): Promise<AdminResponse> {
    const existingUsername = await this.adminRepository.findByUsername(data.username)
    if (existingUsername) {
      throw new Error('Username already exists')
    }

    const existingEmail = await this.adminRepository.findByEmail(data.email)
    if (existingEmail) {
      throw new Error('Email already exists')
    }

    const admin = await this.adminRepository.create(data)
    return this.toAdminResponse(admin)
  }

  async getAdminById(adminId: string): Promise<AdminResponse | null> {
    const admin = await this.adminRepository.findByAdminId(adminId)
    if (!admin) return null
    return this.toAdminResponse(admin)
  }

  async getAllAdmins(): Promise<AdminResponse[]> {
    const admins = await this.adminRepository.findAll()
    return admins.map(admin => this.toAdminResponse(admin))
  }

  async updateAdmin(adminId: string, data: UpdateAdminInput): Promise<AdminResponse> {
    const existingAdmin = await this.adminRepository.findByAdminId(adminId)
    if (!existingAdmin) {
      throw new Error('Admin not found')
    }

    if (data.username && data.username !== existingAdmin.username) {
      const usernameExists = await this.adminRepository.findByUsername(data.username)
      if (usernameExists) {
        throw new Error('Username already exists')
      }
    }

    if (data.email && data.email !== existingAdmin.email) {
      const emailExists = await this.adminRepository.findByEmail(data.email)
      if (emailExists) {
        throw new Error('Email already exists')
      }
    }

    const updatedAdmin = await this.adminRepository.update(adminId, data)
    if (!updatedAdmin) {
      throw new Error('Failed to update admin')
    }

    return this.toAdminResponse(updatedAdmin)
  }

  async deleteAdmin(adminId: string): Promise<void> {
    const admin = await this.adminRepository.findByAdminId(adminId)
    if (!admin) {
      throw new Error('Admin not found')
    }

    const deleted = await this.adminRepository.delete(adminId)
    if (!deleted) {
      throw new Error('Failed to delete admin')
    }
  }

  private toAdminResponse(admin: any): AdminResponse {
    return {
      admin_id: admin.admin_id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
      created_at: admin.created_at,
      last_login: admin.last_login
    }
  }
}
