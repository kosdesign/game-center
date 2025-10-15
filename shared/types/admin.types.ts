export interface Admin {
  admin_id: string
  username: string
  password_hash: string
  email: string
  role: string
  created_at: Date
  last_login?: Date
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  admin: {
    admin_id: string
    username: string
    email: string
    role: string
  }
}
