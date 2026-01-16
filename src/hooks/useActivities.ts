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

// Weighted random sampling
function weightedSample<T>(
  items: T[],
  count: number,
  getWeight: (item: T) => number,
  random: () => number
): T[] {
  if (items.length <= count) return shuffle(items, random)

  const result: T[] = []
  const remaining = [...items]

  while (result.length < count && remaining.length > 0) {
    // Calculate total weight
    const weights = remaining.map(getWeight)
    const totalWeight = weights.reduce((a, b) => a + b, 0)

    // Pick random weighted item
    let r = random() * totalWeight
    let idx = 0
    for (let i = 0; i < weights.length; i++) {
      r -= weights[i]
      if (r <= 0) {
        idx = i
        break
      }
    }

    result.push(remaining[idx])
    remaining.splice(idx, 1)
  }

  return result
}

// Content mix targets
const TARGET_TOTAL = 40
const MIX = {
  article: 0.45,      // ~18 articles
  'tidal-video': 0.40, // ~16 tidal videos
  video: 0.15,        // ~6 nebula videos
}

interface UseActivitiesOptions {
  getWeight?: (source: string, type: string) => number
}

export function useActivities(options: UseActivitiesOptions = {}) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { getWeight } = options

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

        // Weight function for sampling
        const itemWeight = (item: Activity) => {
          if (getWeight) {
            return getWeight(item.source, item.type)
          }
          return 1
        }

        // Sample from each category based on mix ratios
        const sampled: Activity[] = []

        // Sample articles
        if (byType['article']) {
          const count = Math.round(TARGET_TOTAL * MIX.article)
          sampled.push(...weightedSample(byType['article'], count, itemWeight, random))
        }

        // Sample tidal videos
        if (byType['tidal-video']) {
          const count = Math.round(TARGET_TOTAL * MIX['tidal-video'])
          sampled.push(...weightedSample(byType['tidal-video'], count, itemWeight, random))
        }

        // Sample nebula videos
        if (byType['video']) {
          const count = Math.round(TARGET_TOTAL * MIX.video)
          sampled.push(...weightedSample(byType['video'], count, itemWeight, random))
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
  }, [getWeight])

  return { activities, isLoading, error }
}
