import { useState, useEffect } from 'react'
import type { Activity } from '../types/activity'

interface ActivitiesData {
  activities: Activity[]
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

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
        const data: ActivitiesData = await response.json()
        setActivities(shuffleArray(data.activities))
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
