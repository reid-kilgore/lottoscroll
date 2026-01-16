import { memo, useState } from 'react'
import { Film } from 'lucide-react'
import type { TidalVideoActivity } from '../../types/activity'

interface TidalVideoCardProps {
  activity: TidalVideoActivity
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function TidalVideoCardComponent({ activity }: TidalVideoCardProps) {
  const [imgError, setImgError] = useState(false)
  const showImage = activity.imageUrl && !imgError

  const handleOpen = () => {
    window.open(activity.tidalUrl, '_blank', 'noopener,noreferrer')
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

      <div className="relative z-10 max-w-sm px-6 space-y-5 flex flex-col items-center pointer-events-none">
        {showImage ? (
          <div className="relative rounded-xl overflow-hidden shadow-2xl aspect-video max-w-[300px]">
            <img
              src={activity.imageUrl}
              alt={activity.title}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
            {activity.duration && (
              <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 rounded text-xs text-white">
                {formatDuration(activity.duration)}
              </div>
            )}
          </div>
        ) : (
          <div className="w-20 h-20 rounded-2xl bg-rose-400 flex items-center justify-center">
            <Film size={40} className="text-black/70" />
          </div>
        )}

        <div className="space-y-2 text-center">
          <p className="text-sm text-white/60 font-medium">
            {activity.artist}
            {activity.explicit && <span className="ml-2 text-xs bg-white/20 px-1.5 py-0.5 rounded">E</span>}
          </p>
          <h2 className="text-2xl font-bold text-white leading-tight">
            {activity.title}
          </h2>
        </div>
      </div>
    </div>
  )
}

export const TidalVideoCard = memo(TidalVideoCardComponent)
