import { memo } from 'react'
import type { GameActivity } from '../../types/activity'

interface GameCardProps {
  activity: GameActivity
}

function GameCardComponent({ activity }: GameCardProps) {
  const handleOpen = () => {
    window.open(activity.url, '_blank', 'noopener,noreferrer')
  }

  const emoji = activity.emoji || '🎮'

  return (
    <div
      onClick={handleOpen}
      className="relative w-full h-full flex items-center justify-center bg-gradient-to-b from-indigo-900 via-zinc-900 to-black cursor-pointer active:opacity-90"
    >
      <div className="relative z-10 max-w-md px-8 space-y-8 flex flex-col items-center pointer-events-none">
        <div className="text-9xl">{emoji}</div>

        <div className="space-y-3 text-center">
          <p className="text-base text-white/60 font-medium tracking-wide uppercase">{activity.gameName}</p>
          <h2 className="text-4xl font-bold text-white leading-tight">
            {activity.title}
          </h2>
          {activity.description && (
            <p className="text-xl text-white/70">{activity.description}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export const GameCard = memo(GameCardComponent)
