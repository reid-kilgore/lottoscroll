import { memo, useState } from 'react'
import type { TidalActivity } from '../../types/activity'

interface TidalCardProps {
  activity: TidalActivity
}

function TidalCardComponent({ activity }: TidalCardProps) {
  const [imgError, setImgError] = useState(false)
  const showAlbumArt = activity.albumArt && !imgError

  const handleOpen = () => {
    window.open(activity.tidalUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div
      onClick={handleOpen}
      className="relative w-full h-full flex items-center justify-center bg-gradient-to-b from-cyan-900 via-zinc-900 to-black cursor-pointer active:opacity-90"
    >
      {showAlbumArt && (
        <div className="absolute inset-0 pointer-events-none">
          <img
            src={activity.albumArt}
            alt=""
            className="w-full h-full object-cover opacity-30 blur-xl"
            onError={() => setImgError(true)}
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
      )}

      <div className="relative z-10 text-center px-8 space-y-6 pointer-events-none">
        {showAlbumArt ? (
          <img
            src={activity.albumArt}
            alt={activity.title}
            className="w-64 h-64 mx-auto rounded-2xl shadow-2xl object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="text-9xl">🎵</div>
        )}

        <div className="space-y-2">
          <p className="text-base text-white/60 font-medium tracking-wide uppercase">
            🎧 {activity.artist || 'Tidal'}
          </p>
          <h2 className="text-3xl font-bold text-white">{activity.title}</h2>
        </div>
      </div>
    </div>
  )
}

export const TidalCard = memo(TidalCardComponent)
