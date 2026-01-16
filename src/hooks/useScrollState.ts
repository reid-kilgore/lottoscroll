import { useEffect, useState } from 'react'
import type { RefObject } from 'react'

export function useScrollState(
  containerRef: RefObject<HTMLElement | null>,
  debounceMs: number = 150
): boolean {
  const [isScrolling, setIsScrolling] = useState(false)
  const [container, setContainer] = useState<HTMLElement | null>(null)

  // Poll for container availability (ref.current is set after render)
  useEffect(() => {
    if (containerRef.current && !container) {
      setContainer(containerRef.current)
    }
  })

  // Attach scroll listener when container is available
  useEffect(() => {
    if (!container) return

    let timeoutId: number | null = null

    const handleScroll = () => {
      setIsScrolling(true)

      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      timeoutId = window.setTimeout(() => {
        setIsScrolling(false)
        timeoutId = null
      }, debounceMs)
    }

    container.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      container.removeEventListener('scroll', handleScroll)
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [container, debounceMs])

  return isScrolling
}
