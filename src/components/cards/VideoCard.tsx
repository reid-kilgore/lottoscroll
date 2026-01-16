import { memo, useState } from 'react'
import { Play, Film } from 'lucide-react'
import type { VideoActivity } from '../../types/activity'

interface VideoCardProps {
  activity: VideoActivity
}

function VideoCardComponent({ activity }: VideoCardProps) {
  const [imgError, setImgError] = useState(false)
  const showImage = activity.imageUrl && !imgError

  const handleOpen = () => {
    window.open(activity.url, '_blank', 'noopener,noreferrer')
  }

  const isNebula = activity.platform === 'nebula'
  const gradientFrom = isNebula ? 'from-indigo-900' : 'from-red-900'
  const buttonColor = isNebula ? 'bg-indigo-400' : 'bg-red-500'
  const platformLabel = isNebula ? 'Watch on Nebula' : 'Watch on YouTube'

  return (
    <div className={`relative w-full h-full flex items-center justify-center bg-gradient-to-b ${gradientFrom} via-zinc-900 to-black`}>
      {showImage && (
        <div className="absolute inset-0">
          <img
            src={activity.imageUrl}
            alt=""
            className="w-full h-full object-cover opacity-30 blur-xl"
            onError={() => setImgError(true)}
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
      )}

      <div className="relative z-10 max-w-sm px-6 text-center space-y-5">
        {showImage ? (
          <div className="mx-auto rounded-xl overflow-hidden shadow-2xl aspect-video max-w-xs">
            <img
              src={activity.imageUrl}
              alt={activity.title}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          </div>
        ) : (
          <div className={`mx-auto rounded-xl aspect-video max-w-xs flex items-center justify-center ${isNebula ? 'bg-indigo-900/50' : 'bg-red-900/50'}`}>
            <Film size={64} className="text-white/40" />
          </div>
        )}

        <div className="space-y-2">
          <p className="text-sm text-white/60 font-medium">{activity.source}</p>
          <h2 className="text-2xl font-bold text-white leading-tight">
            {activity.title}
          </h2>
          {activity.description && (
            <p className="text-base text-white/60">{activity.description}</p>
          )}
        </div>

        <button
          onClick={handleOpen}
          className={`inline-flex items-center gap-3 px-8 py-4 rounded-full ${buttonColor} text-white font-semibold text-lg transition-all hover:scale-105 active:scale-95`}
        >
          <Play size={22} fill="white" />
          {platformLabel}
        </button>
      </div>
    </div>
  )
}

export const VideoCard = memo(VideoCardComponent)
