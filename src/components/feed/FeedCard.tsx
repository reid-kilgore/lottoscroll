import { memo } from 'react'
import type { Activity } from '../../types/activity'
import { CardRouter } from '../cards/CardRouter'

interface FeedCardProps {
  activity: Activity
  index: number
  onOpen?: () => void
}

function FeedCardComponent({ activity, index, onOpen }: FeedCardProps) {
  return (
    <div
      data-card-index={index}
      className="relative w-full h-dvh snap-start snap-always flex-shrink-0"
    >
      <CardRouter activity={activity} onOpen={onOpen} />
    </div>
  )
}

export const FeedCard = memo(FeedCardComponent)
