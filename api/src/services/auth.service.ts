import jwt from 'jsonwebtoken'
import { AdminRepository } from '../repositories/Admin.repository'
import { LoginResponse } from '@shared/types'

export class AuthService {
  private adminRepository: AdminRepository

  constructor() {
    this.adminRepository = new AdminRepository()
  }

  async login(username: string, password: string): Promise<LoginResponse> {
    const admin = await this.adminRepository.findByUsername(username)

    if (!admin) {
      throw new Error('Invalid credentials')
    }

    const isValidPassword = await this.adminRepository.verifyPassword(admin, password)

    if (!isValidPassword) {
      throw new Error('Invalid credentials')
    }

    await this.adminRepository.updateLastLogin(username)

    const secret = process.env.JWT_SECRET || 'your-super-secret-key-change-this-in-production'
    const expiresIn = process.env.JWT_EXPIRES_IN || '24h'

    const token = jwt.sign(
      {
        admin_id: admin.admin_id,
        username: admin.username,
        role: admin.role
      },
      secret,
      { expiresIn }
    )

    return {
      token,
      admin: {
        admin_id: admin.admin_id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    }
  }
}
