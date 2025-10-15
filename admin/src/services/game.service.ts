import apiService from './api.service'
import { Game, CreateGameRequest, UpdateGameRequest, GameType } from '@shared/types'

class GameService {
  async getAllGames(type?: GameType): Promise<Game[]> {
    const url = type ? `/games?type=${type}` : '/games'
    const response = await apiService.get<Game[]>(url)
    return response.data || []
  }

  async getGameById(id: string): Promise<Game> {
    const response = await apiService.get<Game>(`/games/${id}`)
    if (response.success && response.data) {
      return response.data
    }
    throw new Error('Game not found')
  }

  async createGame(data: CreateGameRequest): Promise<Game> {
    const response = await apiService.post<Game>('/games', data)
    if (response.success && response.data) {
      return response.data
    }
    throw new Error(response.message || 'Failed to create game')
  }

  async updateGame(id: string, version: string, data: UpdateGameRequest): Promise<Game> {
    const response = await apiService.put<Game>(`/games/${id}?version=${version}`, data)
    if (response.success && response.data) {
      return response.data
    }
    throw new Error(response.message || 'Failed to update game')
  }

  async deleteGame(id: string): Promise<void> {
    const response = await apiService.delete(`/games/${id}`)
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete game')
    }
  }
}

export default new GameService()
