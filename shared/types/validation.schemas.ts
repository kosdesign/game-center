import { z } from 'zod'

export const GameTypeSchema = z.enum(['PROD', 'TEST', 'UAT'])
export const ServerGameTypeSchema = z.enum(['UDP', 'TCP'])

export const CreateGameSchema = z.object({
  game_id: z.string().min(1, 'Game ID is required'),
  game_name: z.string().min(1, 'Game name is required'),
  game_version: z.string().min(1, 'Game version is required'),
  description: z.string().min(1, 'Description is required'),
  port: z.number().int().positive('Port must be a positive integer'),
  api_url: z.string().url('API URL must be a valid URL'),
  type: GameTypeSchema,
  match_making_url: z.string().url('Matchmaking URL must be a valid URL'),
  server_game_ip: z.string().ip('Server IP must be a valid IP address'),
  server_game_type: ServerGameTypeSchema
})

export const UpdateGameSchema = z.object({
  game_name: z.string().min(1).optional(),
  game_version: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  port: z.number().int().positive().optional(),
  api_url: z.string().url().optional(),
  type: GameTypeSchema.optional(),
  match_making_url: z.string().url().optional(),
  server_game_ip: z.string().ip().optional(),
  server_game_type: ServerGameTypeSchema.optional(),
  is_active: z.boolean().optional()
})

export const LoginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

export const CreateAdminSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.string().default('admin')
})

export const UpdateAdminSchema = z.object({
  username: z.string().min(3).optional(),
  email: z.string().email().optional(),
  role: z.string().optional()
})

export type CreateGameInput = z.infer<typeof CreateGameSchema>
export type UpdateGameInput = z.infer<typeof UpdateGameSchema>
export type LoginInput = z.infer<typeof LoginSchema>
export type CreateAdminInput = z.infer<typeof CreateAdminSchema>
export type UpdateAdminInput = z.infer<typeof UpdateAdminSchema>
