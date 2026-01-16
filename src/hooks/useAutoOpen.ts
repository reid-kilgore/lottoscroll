import { useState, useEffect, useRef, useCallback } from 'react'

interface UseAutoOpenOptions {
  duration: number
  onOpen: () => void
  isPaused: boolean
  resetKey: number | string
}

interface UseAutoOpenReturn {
  secondsLeft: number
  isPaused: boolean
  reset: () => void
}

export function useAutoOpen({
  duration,
  onOpen,
  isPaused,
  resetKey
}: UseAutoOpenOptions): UseAutoOpenReturn {
  const [timeLeft, setTimeLeft] = useState(duration)
  const intervalRef = useRef<number | null>(null)
  const hasOpenedRef = useRef(false)

  const reset = useCallback(() => {
    setTimeLeft(duration)
    hasOpenedRef.current = false
  }, [duration])

  // Reset when resetKey changes (new card)
  useEffect(() => {
    reset()
  }, [resetKey, reset])

  // Countdown timer
  useEffect(() => {
    if (isPaused || hasOpenedRef.current) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    intervalRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        const next = prev - 100
        if (next <= 0) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
          }
          if (!hasOpenedRef.current) {
            hasOpenedRef.current = true
            onOpen()
          }
          return 0
        }
        return next
      })
    }, 100)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isPaused, onOpen])

  return {
    secondsLeft: Math.ceil(timeLeft / 1000),
    isPaused,
    reset
  }
}
