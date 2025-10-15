import axios from 'axios'
import { CreateAdminInput, UpdateAdminInput } from '@shared/types'

const api = axios.create({
  baseURL: '/api'
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

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
    const response = await api.get('/admin/admins')
    return response.data.data
  },

  async getAdmin(adminId: string): Promise<AdminResponse> {
    const response = await api.get(`/admin/admins/${adminId}`)
    return response.data.data
  },

  async createAdmin(data: CreateAdminInput): Promise<AdminResponse> {
    const response = await api.post('/admin/admins', data)
    return response.data.data
  },

  async updateAdmin(adminId: string, data: UpdateAdminInput): Promise<AdminResponse> {
    const response = await api.put(`/admin/admins/${adminId}`, data)
    return response.data.data
  },

  async deleteAdmin(adminId: string): Promise<void> {
    await api.delete(`/admin/admins/${adminId}`)
  }
}
