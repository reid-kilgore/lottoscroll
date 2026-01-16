import { useState, useEffect } from 'react'
import type { Activity } from '../types/activity'

// Seeded random (mulberry32)
function seededRandom(seed: number) {
  return function() {
    let t = seed += 0x6D2B79F5
    t = Math.imul(t ^ t >>> 15, t | 1)
    t ^= t + Math.imul(t ^ t >>> 7, t | 61)
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

// Shuffle array with seeded random
function shuffle<T>(array: T[], random: () => number): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
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
        const data: Activity[] = await response.json()

        // Seed based on current timestamp - different every page load
        const seed = Date.now()
        const random = seededRandom(seed)
        const shuffled = shuffle(data, random)

        setActivities(shuffled)
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
