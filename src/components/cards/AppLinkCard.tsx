import { memo } from 'react'
import { Smartphone } from 'lucide-react'
import type { AppLinkActivity } from '../../types/activity'

interface AppLinkCardProps {
  activity: AppLinkActivity
}

function AppLinkCardComponent({ activity }: AppLinkCardProps) {
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
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-b from-violet-900 via-zinc-900 to-black">
      <div className="relative z-10 max-w-sm px-6 text-center space-y-5">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-violet-400 flex items-center justify-center">
          <Smartphone size={40} className="text-black/70" />
        </div>

        <div className="space-y-2">
          <p className="text-sm text-white/60 font-medium">{activity.appName}</p>
          <h2 className="text-3xl font-bold text-white leading-tight">
            {activity.title}
          </h2>
          {activity.description && (
            <p className="text-lg text-white/60">{activity.description}</p>
          )}
        </div>

        <button
          onClick={handleOpen}
          className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-violet-400 text-black font-semibold text-lg transition-all hover:scale-105 active:scale-95"
        >
          <Smartphone size={22} />
          Open {activity.appName}
        </button>
      </div>
    </div>
  )
}

export const AppLinkCard = memo(AppLinkCardComponent)
