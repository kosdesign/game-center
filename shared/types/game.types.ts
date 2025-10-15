export type GameType = 'PROD' | 'TEST' | 'UAT'
export type ServerGameType = 'UDP' | 'TCP'
export type PortType = 'fixed' | 'range'

export interface GameParent {
  game_id: string
  game_name: string
  api_token: string
  is_active: boolean
  created_at: Date
  updated_at: Date
}

export interface GameDetails {
  game_id: string
  game_version: string
  description: string
  port_type: PortType
  port?: number
  port_start?: number
  port_end?: number
  api_url: string
  type: GameType
  match_making_url?: string
  server_game_ip: string
  server_game_type: ServerGameType
  is_active: boolean
  created_at: Date
  updated_at: Date
}

export interface Game extends GameParent, Omit<GameDetails, 'game_id' | 'is_active' | 'created_at' | 'updated_at'> {}

export interface CreateGameRequest {
  game_id: string
  game_name: string
  game_version: string
  description: string
  port_type: PortType
  port?: number
  port_start?: number
  port_end?: number
  api_url: string
  type: GameType
  match_making_url?: string
  server_game_ip: string
  server_game_type: ServerGameType
}

export interface UpdateGameRequest {
  game_name?: string
  game_version?: string
  description?: string
  port_type?: PortType
  port?: number
  port_start?: number
  port_end?: number
  api_url?: string
  type?: GameType
  match_making_url?: string
  server_game_ip?: string
  server_game_type?: ServerGameType
  is_active?: boolean
}

export interface GameParentResponse {
  game_id: string
  game_name: string
  versions: GameDetails[]
  is_active: boolean
}
