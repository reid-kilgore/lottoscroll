import { memo } from 'react'
import { Gamepad2 } from 'lucide-react'
import type { GameActivity } from '../../types/activity'

interface GameCardProps {
  activity: GameActivity
}

function GameCardComponent({ activity }: GameCardProps) {
  const handleOpen = () => {
    window.open(activity.url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-b from-indigo-900 via-zinc-900 to-black">
      <div className="relative z-10 max-w-sm px-6 space-y-5 flex flex-col items-center">
        <div className="w-24 h-24 rounded-2xl bg-indigo-400 flex items-center justify-center">
          <Gamepad2 size={48} className="text-black/70" />
        </div>

        <div className="space-y-2 text-center">
          <p className="text-sm text-white/60 font-medium">{activity.gameName}</p>
          <h2 className="text-3xl font-bold text-white leading-tight">
            {activity.title}
          </h2>
          {activity.description && (
            <p className="text-lg text-white/60">{activity.description}</p>
          )}
        </div>

        <button
          onClick={handleOpen}
          className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-indigo-400 text-black font-semibold text-lg transition-all hover:scale-105 active:scale-95"
        >
          <Gamepad2 size={22} />
          Play
        </button>
      </div>
    </div>
  )
}

export const GameCard = memo(GameCardComponent)
