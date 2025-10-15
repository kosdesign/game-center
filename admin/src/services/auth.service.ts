import apiService from './api.service'
import { LoginRequest, LoginResponse, ApiResponse } from '@shared/types'

class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiService.post<LoginResponse>('/auth/login', credentials)
    if (response.success && response.data) {
      return response.data
    }
    throw new Error(response.message || 'Login failed')
  }
}

export default new AuthService()
