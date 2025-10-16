import apiService from './api.service'
import { CreateAdminInput, UpdateAdminInput } from '@shared/types'

export interface AdminResponse {
  admin_id: string
  username: string
  email: string
  role: string
  created_at: Date
  last_login?: Date
}

export const adminService = {
  async getAdmins(): Promise<AdminResponse[]> {
    const response = await apiService.get<AdminResponse[]>('/admin/admins')
    return response.data || []
  },

  async getAdmin(adminId: string): Promise<AdminResponse> {
    const response = await apiService.get<AdminResponse>(`/admin/admins/${adminId}`)
    if (!response.data) {
      throw new Error('Admin not found')
    }
    return response.data
  },

  async createAdmin(data: CreateAdminInput): Promise<AdminResponse> {
    const response = await apiService.post<AdminResponse>('/admin/admins', data)
    if (!response.data) {
      throw new Error('Failed to create admin')
    }
    return response.data
  },

  async updateAdmin(adminId: string, data: UpdateAdminInput): Promise<AdminResponse> {
    const response = await apiService.put<AdminResponse>(`/admin/admins/${adminId}`, data)
    if (!response.data) {
      throw new Error('Failed to update admin')
    }
    return response.data
  },

  async deleteAdmin(adminId: string): Promise<void> {
    await apiService.delete(`/admin/admins/${adminId}`)
  }
}
