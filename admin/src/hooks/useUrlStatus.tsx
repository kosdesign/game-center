import { useState, useEffect } from 'react'

export interface UrlStatusInfo {
  status: 'online' | 'offline' | 'checking'
  statusCode?: number
  statusText?: string
}

interface UrlStatusMap {
  [url: string]: UrlStatusInfo
}

export const useUrlStatus = (urls: string[]) => {
  const [statuses, setStatuses] = useState<UrlStatusMap>({})

  useEffect(() => {
    if (urls.length === 0) return

    // Set all to checking initially
    const initialStatuses: UrlStatusMap = {}
    urls.forEach(url => {
      initialStatuses[url] = { status: 'checking' }
    })
    setStatuses(initialStatuses)

    // Check each URL
    urls.forEach(async (url) => {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000) // 5s timeout

        await fetch(url, {
          method: 'HEAD',
          mode: 'no-cors',
          signal: controller.signal
        })

        clearTimeout(timeoutId)

        // With no-cors mode, we can't read status but successful fetch means reachable
        setStatuses(prev => ({
          ...prev,
          [url]: {
            status: 'online',
            statusText: 'Reachable'
          }
        }))
      } catch (error) {
        // Try with CORS to get actual status code
        try {
          const response = await fetch(url, {
            method: 'HEAD'
          })

          // Any response (even 4xx, 5xx) means URL is reachable
          setStatuses(prev => ({
            ...prev,
            [url]: {
              status: 'online',
              statusCode: response.status,
              statusText: response.statusText
            }
          }))
        } catch (corsError) {
          setStatuses(prev => ({
            ...prev,
            [url]: {
              status: 'offline',
              statusText: error instanceof Error ? error.message : 'Failed to fetch'
            }
          }))
        }
      }
    })
  }, [urls.join(',')])

  return statuses
}
