import type { Activity } from '../types/activity'

export function openActivity(activity: Activity): void {
  switch (activity.type) {
    case 'article':
      window.open(activity.url, '_blank', 'noopener,noreferrer')
      break

    case 'video':
      window.open(activity.url, '_blank', 'noopener,noreferrer')
      break

    case 'tidal':
      window.open(activity.tidalUrl, '_blank', 'noopener,noreferrer')
      break

    case 'tidal-video':
      window.open(activity.tidalUrl, '_blank', 'noopener,noreferrer')
      break

    case 'game':
      window.open(activity.url, '_blank', 'noopener,noreferrer')
      break

    case 'app-link':
      openAppLink(activity)
      break
  }
}

function openAppLink(activity: Extract<Activity, { type: 'app-link' }>): void {
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
    if (document.body.contains(iframe)) {
      document.body.removeChild(iframe)
    }
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
