import apiService from './api.service'
import { GameType, ServerGameType } from '@shared/types'

export interface GameVersion {
  game_id: string
  game_version: string
  description: string
  port_type: 'fixed' | 'range'
  port?: number
  port_start?: number
  port_end?: number
  api_url: string
  type: GameType
  match_making_url?: string
  server_game_ip: string
  server_game_type: ServerGameType
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateGameVersionRequest {
  game_version: string
  description: string
  port: number
  api_url: string
  type: GameType
  match_making_url: string
  server_game_ip: string
  server_game_type: ServerGameType
}

class GameVersionService {
  async getVersionsByGameId(gameId: string): Promise<GameVersion[]> {
    const response = await apiService.get<GameVersion[]>(`/games/parents/${gameId}/versions`)
    return response.data || []
  }

  async createVersion(gameId: string, data: CreateGameVersionRequest): Promise<GameVersion> {
    const response = await apiService.post<GameVersion>(`/games/parents/${gameId}/versions`, data)
    if (response.success && response.data) {
      return response.data
    }
    throw new Error(response.message || 'Failed to create version')
  }

  async updateVersion(
    gameId: string,
    version: string,
    data: Partial<CreateGameVersionRequest>
  ): Promise<GameVersion> {
    const response = await apiService.put<GameVersion>(
      `/games/parents/${gameId}/versions/${version}`,
      data
    )
    if (response.success && response.data) {
      return response.data
    }
    throw new Error(response.message || 'Failed to update version')
  }

  async deleteVersion(gameId: string, version: string): Promise<void> {
    const response = await apiService.delete(`/games/parents/${gameId}/versions/${version}`)
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete version')
    }
  }
}

export default new GameVersionService()
