import { useEffect, useState } from 'react'
import type { RefObject } from 'react'

export function useVisibleCard(
  containerRef: RefObject<HTMLElement | null>,
  cardSelector: string = '[data-card-index]'
): number {
  const [visibleIndex, setVisibleIndex] = useState(0)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const cards = container.querySelectorAll(cardSelector)
    if (cards.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            const index = (entry.target as HTMLElement).dataset.cardIndex
            if (index !== undefined) {
              setVisibleIndex(parseInt(index, 10))
            }
          }
        }
      },
      {
        root: container,
        threshold: 0.6
      }
    )

    cards.forEach(card => observer.observe(card))

    return () => observer.disconnect()
  }, [containerRef, cardSelector])

  return visibleIndex
}
