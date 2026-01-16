import { memo, useState } from 'react'
import type { TidalVideoActivity } from '../../types/activity'

interface TidalVideoCardProps {
  activity: TidalVideoActivity
  onOpen?: () => void
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function TidalVideoCardComponent({ activity, onOpen }: TidalVideoCardProps) {
  const [imgError, setImgError] = useState(false)
  const showImage = activity.imageUrl && !imgError

  const handleOpen = () => {
    window.open(activity.tidalUrl, '_blank', 'noopener,noreferrer')
    onOpen?.()
  }

  return (
    <div
      onClick={handleOpen}
      className="relative w-full h-full flex items-center justify-center bg-gradient-to-b from-rose-900 via-zinc-900 to-black cursor-pointer active:opacity-90"
    >
      {showImage && (
        <div className="absolute inset-0 pointer-events-none">
          <img
            src={activity.imageUrl}
            alt=""
            className="w-full h-full object-cover opacity-25 blur-xl"
            onError={() => setImgError(true)}
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
      )}

      <div className="relative z-10 max-w-md px-8 space-y-6 flex flex-col items-center pointer-events-none">
        {showImage ? (
          <div className="relative rounded-2xl overflow-hidden shadow-2xl w-full max-w-[340px]">
            <img
              src={activity.imageUrl}
              alt={activity.title}
              className="w-full aspect-video object-cover"
              onError={() => setImgError(true)}
            />
            {activity.duration && (
              <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-black/80 rounded-lg text-sm font-medium text-white">
                {formatDuration(activity.duration)}
              </div>
            )}
          </div>
        ) : (
          <div className="text-9xl">🎬</div>
        )}

        <div className="space-y-2 text-center">
          <p className="text-base text-white/60 font-medium tracking-wide uppercase">
            📺 {activity.artist}
            {activity.explicit && <span className="ml-2 text-xs bg-white/20 px-2 py-1 rounded">E</span>}
          </p>
          <h2 className="text-3xl font-bold text-white leading-tight">
            {activity.title}
          </h2>
        </div>
      </div>
    </div>
  )
}

export const TidalVideoCard = memo(TidalVideoCardComponent)
