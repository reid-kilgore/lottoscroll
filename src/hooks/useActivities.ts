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

// Sample n items from array
function sample<T>(array: T[], n: number, random: () => number): T[] {
  const shuffled = shuffle(array, random)
  return shuffled.slice(0, Math.min(n, array.length))
}

// Content mix targets
const TARGET_TOTAL = 40
const MIX = {
  article: 0.45,      // ~18 articles
  'tidal-video': 0.40, // ~16 tidal videos
  video: 0.15,        // ~6 nebula videos
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

        // Group by type
        const byType: Record<string, Activity[]> = {}
        for (const item of data) {
          const type = item.type
          if (!byType[type]) byType[type] = []
          byType[type].push(item)
        }

        // Sample from each category based on mix ratios
        const sampled: Activity[] = []

        // Sample articles
        if (byType['article']) {
          const count = Math.round(TARGET_TOTAL * MIX.article)
          sampled.push(...sample(byType['article'], count, random))
        }

        // Sample tidal videos
        if (byType['tidal-video']) {
          const count = Math.round(TARGET_TOTAL * MIX['tidal-video'])
          sampled.push(...sample(byType['tidal-video'], count, random))
        }

        // Sample nebula videos
        if (byType['video']) {
          const count = Math.round(TARGET_TOTAL * MIX.video)
          sampled.push(...sample(byType['video'], count, random))
        }

        // Always include all games, app-links, and tidal tracks
        const alwaysInclude = ['game', 'app-link', 'tidal']
        for (const type of alwaysInclude) {
          if (byType[type]) {
            sampled.push(...byType[type])
          }
        }

        // Final shuffle
        const shuffled = shuffle(sampled, random)

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
