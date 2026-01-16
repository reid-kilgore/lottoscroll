import { useActivities } from '../../hooks/useActivities'
import { FeedCard } from './FeedCard'

export function Feed() {
  const { activities, isLoading, error } = useActivities()

  if (isLoading) {
    return (
      <div className="h-dvh w-full flex items-center justify-center bg-black">
        <div className="text-white/60 text-lg">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-dvh w-full flex items-center justify-center bg-black">
        <div className="text-red-400 text-lg">{error}</div>
      </div>
    )
  }

  return (
    <div className="h-dvh w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide">
      {activities.map((activity) => (
        <FeedCard key={activity.id} activity={activity} />
      ))}
    </div>
  )
}
