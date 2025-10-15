import crypto from 'crypto'

export const generateApiToken = (gameId: string): string => {
  const timestamp = Date.now().toString()
  const random = crypto.randomBytes(16).toString('hex')
  const data = `${gameId}:${timestamp}:${random}`

  const hash = crypto.createHash('sha256').update(data).digest('hex')

  return `${gameId}.${hash}`
}

export const extractGameIdFromToken = (token: string): string | null => {
  try {
    const parts = token.split('.')
    if (parts.length !== 2) return null
    return parts[0]
  } catch {
    return null
  }
}

export const verifyApiToken = (token: string, expectedGameId: string): boolean => {
  const gameId = extractGameIdFromToken(token)
  return gameId === expectedGameId
}
