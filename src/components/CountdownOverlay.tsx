import { memo } from 'react'

interface CountdownOverlayProps {
  secondsLeft: number
  isPaused: boolean
}

function CountdownOverlayComponent({ secondsLeft, isPaused }: CountdownOverlayProps) {
  // Calculate progress for the ring (0 to 1)
  const progress = secondsLeft / 5
  const circumference = 2 * Math.PI * 45 // radius = 45
  const strokeDashoffset = circumference * (1 - progress)

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center pointer-events-none pb-safe">
      <div className="relative w-24 h-24">
        {/* Background ring */}
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="6"
          />
          {/* Progress ring */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={isPaused ? 'rgba(255,255,255,0.4)' : 'white'}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-100"
          />
        </svg>

        {/* Number in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-4xl font-bold ${isPaused ? 'text-white/40' : 'text-white'}`}>
            {secondsLeft}
          </span>
        </div>

        {/* Paused indicator */}
        {isPaused && (
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-white/50 uppercase tracking-wider">
            paused
          </div>
        )}
      </div>
    </div>
  )
}

export const CountdownOverlay = memo(CountdownOverlayComponent)
