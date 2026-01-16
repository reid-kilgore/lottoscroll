import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'lottoscroll-preferences'

// Weight adjustments: positive = more, negative = less
// Range: -3 to +3, each step roughly doubles/halves probability
export interface Preferences {
  sourceWeights: Record<string, number>  // e.g., "Paris Review" -> 2
  typeWeights: Record<string, number>    // e.g., "article" -> -1
}

const DEFAULT_PREFERENCES: Preferences = {
  sourceWeights: {},
  typeWeights: {}
}

export function usePreferences() {
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setPreferences(JSON.parse(stored))
      }
    } catch {
      // Ignore parse errors
    }
  }, [])


  const adjustSourceWeight = useCallback((source: string, delta: number) => {
    setPreferences(prev => {
      const current = prev.sourceWeights[source] || 0
      const newWeight = Math.max(-3, Math.min(3, current + delta))
      const newPrefs = {
        ...prev,
        sourceWeights: {
          ...prev.sourceWeights,
          [source]: newWeight
        }
      }
      // Clean up zero weights
      if (newWeight === 0) {
        delete newPrefs.sourceWeights[source]
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newPrefs))
      } catch {}
      return newPrefs
    })
  }, [])

  const adjustTypeWeight = useCallback((type: string, delta: number) => {
    setPreferences(prev => {
      const current = prev.typeWeights[type] || 0
      const newWeight = Math.max(-3, Math.min(3, current + delta))
      const newPrefs = {
        ...prev,
        typeWeights: {
          ...prev.typeWeights,
          [type]: newWeight
        }
      }
      if (newWeight === 0) {
        delete newPrefs.typeWeights[type]
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newPrefs))
      } catch {}
      return newPrefs
    })
  }, [])

  const likeSource = useCallback((source: string) => {
    adjustSourceWeight(source, 1)
  }, [adjustSourceWeight])

  const dislikeSource = useCallback((source: string) => {
    adjustSourceWeight(source, -1)
  }, [adjustSourceWeight])

  const likeType = useCallback((type: string) => {
    adjustTypeWeight(type, 1)
  }, [adjustTypeWeight])

  const dislikeType = useCallback((type: string) => {
    adjustTypeWeight(type, -1)
  }, [adjustTypeWeight])

  const clearPreferences = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES)
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {}
  }, [])

  // Calculate weight for an activity (used in sampling)
  const getWeight = useCallback((source: string, type: string): number => {
    const sourceWeight = preferences.sourceWeights[source] || 0
    const typeWeight = preferences.typeWeights[type] || 0
    // Convert to multiplier: each +1 doubles, each -1 halves
    // weight 0 = 1x, weight 1 = 2x, weight -1 = 0.5x, weight 3 = 8x, weight -3 = 0.125x
    return Math.pow(2, sourceWeight + typeWeight)
  }, [preferences])

  return {
    preferences,
    likeSource,
    dislikeSource,
    likeType,
    dislikeType,
    clearPreferences,
    getWeight
  }
}
