import { memo, useState } from 'react'
import type { VideoActivity } from '../../types/activity'

interface VideoCardProps {
  activity: VideoActivity
}

const NEBULA_CREATORS: Record<string, string> = {
  'bigjoel': '🎭',
  'dex': '🌟',
  'foamparty': '🎪',
  'jacob-geller': '🎮',
  'ladyemily': '📺',
  'lauracrone': '🎬',
  'lilyalexandre': '💭',
  'lindsayellis': '🎥',
  'littlejoel': '🎭',
  'mancarryingthing': '📦',
  'munecat': '😺',
  'overvieweffekt': '🌍',
  'philosophytube': '🎭',
  'princessweekes': '📖',
  'raz': '🌙',
  'razbuten': '🎮',
  'sarahz': '📚',
  'theprince': '👑',
  'watchcinemaofmeaning': '🎬',
}

function VideoCardComponent({ activity }: VideoCardProps) {
  const [imgError, setImgError] = useState(false)
  const showImage = activity.imageUrl && !imgError

  const handleOpen = () => {
    window.open(activity.url, '_blank', 'noopener,noreferrer')
  }

  const isNebula = activity.platform === 'nebula'
  const gradientFrom = isNebula ? 'from-indigo-900' : 'from-red-900'
  const platformEmoji = isNebula ? '🌌' : '▶️'
  const creatorEmoji = NEBULA_CREATORS[activity.source] || '🎬'

  return (
    <div
      onClick={handleOpen}
      className={`relative w-full h-full flex items-center justify-center bg-gradient-to-b ${gradientFrom} via-zinc-900 to-black cursor-pointer active:opacity-90`}
    >
      {showImage && (
        <div className="absolute inset-0 pointer-events-none">
          <img
            src={activity.imageUrl}
            alt=""
            className="w-full h-full object-cover opacity-30 blur-xl"
            onError={() => setImgError(true)}
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
      )}

      <div className="relative z-10 max-w-md px-8 text-center space-y-6 pointer-events-none">
        {showImage ? (
          <div className="mx-auto rounded-2xl overflow-hidden shadow-2xl w-full max-w-[340px]">
            <img
              src={activity.imageUrl}
              alt={activity.title}
              className="w-full aspect-video object-cover"
              onError={() => setImgError(true)}
            />
          </div>
        ) : (
          <div className="text-9xl">{creatorEmoji}</div>
        )}

        <div className="space-y-3">
          <p className="text-base text-white/60 font-medium tracking-wide uppercase">
            {platformEmoji} {activity.source}
          </p>
          <h2 className="text-3xl font-bold text-white leading-tight">
            {activity.title}
          </h2>
          {activity.description && (
            <p className="text-lg text-white/70 line-clamp-2">{activity.description}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export const VideoCard = memo(VideoCardComponent)
