import apiService from './api.service'

export interface GameParent {
  game_id: string
  game_name: string
  is_active: boolean
  created_at: string
  updated_at: string
}

class GameParentService {
  async getAllGames(): Promise<GameParent[]> {
    const response = await apiService.get<GameParent[]>('/games/parents')
    return response.data || []
  }

  async getGameById(id: string): Promise<GameParent> {
    const response = await apiService.get<GameParent>(`/games/parents/${id}`)
    if (response.success && response.data) {
      return response.data
    }
    throw new Error('Game not found')
  }

  async createGame(data: { game_id: string; game_name: string }): Promise<GameParent> {
    const response = await apiService.post<GameParent>('/games/parents', data)
    if (response.success && response.data) {
      return response.data
    }
    throw new Error(response.message || 'Failed to create game')
  }

  async updateGame(id: string, data: { game_name: string }): Promise<GameParent> {
    const response = await apiService.put<GameParent>(`/games/parents/${id}`, data)
    if (response.success && response.data) {
      return response.data
    }
    throw new Error(response.message || 'Failed to update game')
  }

  async deleteGame(id: string): Promise<void> {
    const response = await apiService.delete(`/games/parents/${id}`)
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete game')
    }
  }
}

export default new GameParentService()
