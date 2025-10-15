import { useState, useEffect } from 'react'

interface UrlStatus {
  [url: string]: 'online' | 'offline' | 'checking'
}

export const useUrlStatus = (urls: string[]) => {
  const [statuses, setStatuses] = useState<UrlStatus>({})

  useEffect(() => {
    if (urls.length === 0) return

    // Set all to checking initially
    const initialStatuses: UrlStatus = {}
    urls.forEach(url => {
      initialStatuses[url] = 'checking'
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

        // With no-cors, we can't read the status, but if fetch succeeds, URL is reachable
        setStatuses(prev => ({ ...prev, [url]: 'online' }))
      } catch (error) {
        setStatuses(prev => ({ ...prev, [url]: 'offline' }))
      }
    })
  }, [urls.join(',')])

  return statuses
}
