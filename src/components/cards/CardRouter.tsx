import type { Activity } from '../../types/activity'
import { ArticleCard } from './ArticleCard'
import { TidalCard } from './TidalCard'
import { TidalVideoCard } from './TidalVideoCard'
import { VideoCard } from './VideoCard'
import { AppLinkCard } from './AppLinkCard'
import { GameCard } from './GameCard'

interface CardRouterProps {
  activity: Activity
}

export function CardRouter({ activity }: CardRouterProps) {
  switch (activity.type) {
    case 'article':
      return <ArticleCard activity={activity} />
    case 'tidal':
      return <TidalCard activity={activity} />
    case 'tidal-video':
      return <TidalVideoCard activity={activity} />
    case 'video':
      return <VideoCard activity={activity} />
    case 'app-link':
      return <AppLinkCard activity={activity} />
    case 'game':
      return <GameCard activity={activity} />
    default: {
      const _exhaustive: never = activity
      throw new Error(`Unknown activity type: ${_exhaustive}`)
    }
  }
}
