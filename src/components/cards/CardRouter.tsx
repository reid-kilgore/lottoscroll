import type { Activity } from '../../types/activity'
import { ArticleCard } from './ArticleCard'
import { TidalCard } from './TidalCard'
import { TidalVideoCard } from './TidalVideoCard'
import { VideoCard } from './VideoCard'
import { AppLinkCard } from './AppLinkCard'
import { GameCard } from './GameCard'

interface CardRouterProps {
  activity: Activity
  onOpen?: () => void
}

export function CardRouter({ activity, onOpen }: CardRouterProps) {
  switch (activity.type) {
    case 'article':
      return <ArticleCard activity={activity} onOpen={onOpen} />
    case 'tidal':
      return <TidalCard activity={activity} onOpen={onOpen} />
    case 'tidal-video':
      return <TidalVideoCard activity={activity} onOpen={onOpen} />
    case 'video':
      return <VideoCard activity={activity} onOpen={onOpen} />
    case 'app-link':
      return <AppLinkCard activity={activity} onOpen={onOpen} />
    case 'game':
      return <GameCard activity={activity} onOpen={onOpen} />
    default: {
      const _exhaustive: never = activity
      throw new Error(`Unknown activity type: ${_exhaustive}`)
    }
  }
}
