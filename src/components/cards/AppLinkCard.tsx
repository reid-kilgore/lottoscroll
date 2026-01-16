import { memo } from 'react'
import type { AppLinkActivity } from '../../types/activity'

interface AppLinkCardProps {
  activity: AppLinkActivity
  onOpen?: () => void
}

function AppLinkCardComponent({ activity, onOpen }: AppLinkCardProps) {
  const handleOpen = () => {
    // Try to open the app via scheme
    const iframe = document.createElement('iframe')
    iframe.style.display = 'none'
    iframe.src = activity.appScheme
    document.body.appendChild(iframe)

    // Fallback to web URL after timeout
    const timeout = setTimeout(() => {
      if (activity.fallbackUrl) {
        window.open(activity.fallbackUrl, '_blank', 'noopener,noreferrer')
      }
      document.body.removeChild(iframe)
    }, 1500)

    // Clean up if app opens (page becomes hidden)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearTimeout(timeout)
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe)
        }
        document.removeEventListener('visibilitychange', handleVisibilityChange)
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    onOpen?.()
  }

  const emoji = activity.emoji || '📱'

  return (
    <div
      onClick={handleOpen}
      className="relative w-full h-full flex items-center justify-center bg-gradient-to-b from-violet-900 via-zinc-900 to-black cursor-pointer active:opacity-90"
    >
      <div className="relative z-10 max-w-md px-8 text-center space-y-8 pointer-events-none">
        <div className="text-9xl">{emoji}</div>

        <div className="space-y-3">
          <p className="text-base text-white/60 font-medium tracking-wide uppercase">{activity.appName}</p>
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

export const AppLinkCard = memo(AppLinkCardComponent)
