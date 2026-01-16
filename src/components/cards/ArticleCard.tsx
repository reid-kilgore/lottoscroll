import { memo, useState } from 'react'
import type { ArticleActivity } from '../../types/activity'

interface ArticleCardProps {
  activity: ArticleActivity
  onOpen?: () => void
}

const SOURCE_CONFIG: Record<string, { gradient: string; accent: string; emoji: string }> = {
  'Paris Review': { gradient: 'from-amber-900', accent: 'bg-amber-400', emoji: '📖' },
  'NYRB': { gradient: 'from-emerald-900', accent: 'bg-emerald-400', emoji: '📚' },
  'THE CITY': { gradient: 'from-blue-900', accent: 'bg-blue-400', emoji: '🏙️' },
  '404 Media': { gradient: 'from-purple-900', accent: 'bg-purple-400', emoji: '🔒' },
  'Aftermath': { gradient: 'from-red-900', accent: 'bg-red-400', emoji: '🎮' },
  'Hell Gate': { gradient: 'from-orange-900', accent: 'bg-orange-400', emoji: '🔥' },
  'Simon Willison': { gradient: 'from-sky-900', accent: 'bg-sky-400', emoji: '🤖' },
  'charli bb': { gradient: 'from-pink-900', accent: 'bg-pink-400', emoji: '💭' },
  'Hacker News': { gradient: 'from-orange-900', accent: 'bg-orange-500', emoji: '🟠' },
  'Lobsters': { gradient: 'from-red-900', accent: 'bg-red-500', emoji: '🦞' },
}

const DEFAULT_CONFIG = { gradient: 'from-zinc-800', accent: 'bg-zinc-400', emoji: '📰' }

function ArticleCardComponent({ activity, onOpen }: ArticleCardProps) {
  const [imgError, setImgError] = useState(false)
  const config = SOURCE_CONFIG[activity.source] || DEFAULT_CONFIG
  const showImage = activity.imageUrl && !imgError

  const handleOpen = () => {
    window.open(activity.url, '_blank', 'noopener,noreferrer')
    onOpen?.()
  }

  return (
    <div
      onClick={handleOpen}
      className={`relative w-full h-full flex items-center justify-center bg-gradient-to-b ${config.gradient} via-zinc-900 to-black cursor-pointer active:opacity-90`}
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

      <div className="relative z-10 w-full max-w-md px-8 space-y-6 flex flex-col items-center pointer-events-none">
        {showImage ? (
          <div className="rounded-2xl overflow-hidden shadow-2xl w-full max-w-[320px]">
            <img
              src={activity.imageUrl}
              alt={activity.title}
              className="w-full aspect-[4/3] object-cover"
              onError={() => setImgError(true)}
            />
          </div>
        ) : (
          <div className="text-8xl">{config.emoji}</div>
        )}

        <div className="space-y-3 text-center">
          <p className="text-base text-white/60 font-medium tracking-wide uppercase">
            {config.emoji} {activity.source}
          </p>
          <h2 className="text-3xl font-bold text-white leading-tight">
            {activity.title}
          </h2>
          {activity.description && (
            <p className="text-lg text-white/70 line-clamp-3 leading-relaxed">{activity.description}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export const ArticleCard = memo(ArticleCardComponent)
