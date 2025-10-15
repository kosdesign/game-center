import axios, { AxiosInstance } from 'axios'
import { ApiResponse } from '@shared/types'

class ApiService {
  private api: AxiosInstance

  constructor() {
    this.api = axios.create({
      baseURL: '/api',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('auth_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })

    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token')
          localStorage.removeItem('auth_user')
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }

  async get<T>(url: string): Promise<ApiResponse<T>> {
    const response = await this.api.get<ApiResponse<T>>(url)
    return response.data
  }

  async post<T>(url: string, data: any): Promise<ApiResponse<T>> {
    const response = await this.api.post<ApiResponse<T>>(url, data)
    return response.data
  }

  async put<T>(url: string, data: any): Promise<ApiResponse<T>> {
    const response = await this.api.put<ApiResponse<T>>(url, data)
    return response.data
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    const response = await this.api.delete<ApiResponse<T>>(url)
    return response.data
  }
}

export default new ApiService()
