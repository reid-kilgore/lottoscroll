import { memo, useState } from 'react'
import { Music, Disc3 } from 'lucide-react'
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
    <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-b from-cyan-900 via-zinc-900 to-black">
      {showAlbumArt && (
        <div className="absolute inset-0">
          <img
            src={activity.albumArt}
            alt=""
            className="w-full h-full object-cover opacity-30 blur-xl"
            onError={() => setImgError(true)}
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
      )}

      <div className="relative z-10 text-center px-8 space-y-6">
        {showAlbumArt ? (
          <img
            src={activity.albumArt}
            alt={activity.title}
            className="w-48 h-48 mx-auto rounded-xl shadow-2xl object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-48 h-48 mx-auto rounded-xl bg-cyan-900/50 flex items-center justify-center">
            <Disc3 size={80} className="text-cyan-400/60" />
          </div>
        )}

        <div>
          <h2 className="text-3xl font-bold text-white">{activity.title}</h2>
          {activity.artist && (
            <p className="text-xl text-white/70 mt-2">{activity.artist}</p>
          )}
          {activity.description && (
            <p className="text-base text-white/50 mt-1">{activity.description}</p>
          )}
        </div>

        <button
          onClick={handleOpen}
          className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-cyan-400 text-black font-semibold text-lg transition-all hover:scale-105 active:scale-95"
        >
          <Music size={22} />
          Listen on Tidal
        </button>
      </div>
    </div>
  )
}

export const TidalCard = memo(TidalCardComponent)
