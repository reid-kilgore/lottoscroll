import { memo, useState } from 'react'
import { BookOpen, Newspaper } from 'lucide-react'
import type { ArticleActivity } from '../../types/activity'

interface ArticleCardProps {
  activity: ArticleActivity
}

const SOURCE_CONFIG: Record<string, { gradient: string; accent: string }> = {
  'Paris Review': { gradient: 'from-amber-900', accent: 'bg-amber-400' },
  'NYRB': { gradient: 'from-emerald-900', accent: 'bg-emerald-400' },
  'THE CITY': { gradient: 'from-blue-900', accent: 'bg-blue-400' },
  '404 Media': { gradient: 'from-purple-900', accent: 'bg-purple-400' },
  'Aftermath': { gradient: 'from-red-900', accent: 'bg-red-400' },
  'Hell Gate': { gradient: 'from-orange-900', accent: 'bg-orange-400' },
}

const DEFAULT_CONFIG = { gradient: 'from-zinc-800', accent: 'bg-zinc-400' }

function ArticleCardComponent({ activity }: ArticleCardProps) {
  const [imgError, setImgError] = useState(false)
  const config = SOURCE_CONFIG[activity.source] || DEFAULT_CONFIG
  const showImage = activity.imageUrl && !imgError

  const handleOpen = () => {
    window.open(activity.url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className={`relative w-full h-full flex items-center justify-center bg-gradient-to-b ${config.gradient} via-zinc-900 to-black`}>
      {showImage && (
        <div className="absolute inset-0">
          <img
            src={activity.imageUrl}
            alt=""
            className="w-full h-full object-cover opacity-25 blur-xl"
            onError={() => setImgError(true)}
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
      )}

      <div className="relative z-10 max-w-sm px-6 space-y-5 flex flex-col items-center">
        {/* Visual element - either image or icon */}
        {showImage ? (
          <div className="rounded-xl overflow-hidden shadow-2xl aspect-[4/3] max-w-[280px]">
            <img
              src={activity.imageUrl}
              alt={activity.title}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          </div>
        ) : (
          <div className={`w-20 h-20 rounded-2xl ${config.accent} flex items-center justify-center`}>
            <Newspaper size={40} className="text-black/70" />
          </div>
        )}

        <div className="space-y-2 text-center">
          <p className="text-sm text-white/60 font-medium">{activity.source}</p>
          <h2 className="text-3xl font-bold text-white leading-tight">
            {activity.title}
          </h2>
          {activity.description && (
            <p className="text-lg text-white/60">{activity.description}</p>
          )}
        </div>

        <button
          onClick={handleOpen}
          className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white text-black font-semibold text-lg transition-all hover:scale-105 active:scale-95"
        >
          <BookOpen size={22} />
          Read
        </button>
      </div>
    </div>
  )
}

export const ArticleCard = memo(ArticleCardComponent)
