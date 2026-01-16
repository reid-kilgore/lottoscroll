import { memo } from 'react'
import type { Activity } from '../../types/activity'
import { CardRouter } from '../cards/CardRouter'

interface FeedCardProps {
  activity: Activity
}

function FeedCardComponent({ activity }: FeedCardProps) {
  return (
    <div
      className="relative w-full h-dvh snap-start snap-always flex-shrink-0"
    >
      <CardRouter activity={activity} />
    </div>
  )
}

export const FeedCard = memo(FeedCardComponent)
