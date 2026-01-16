import { useState, useEffect } from 'react'
import type { Activity } from '../types/activity'

export function useActivities() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadActivities() {
      try {
        const response = await fetch('/activities.json')
        if (!response.ok) {
          throw new Error('Failed to load activities')
        }
        const data: Activity[] = await response.json()
        setActivities(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }

    loadActivities()
  }, [])

  return { activities, isLoading, error }
}
