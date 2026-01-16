import { memo } from 'react'
import type { Activity } from '../types/activity'

interface PostOpenOverlayProps {
  activity: Activity
  onDismiss: () => void
}

function PostOpenOverlayComponent({ activity, onDismiss }: PostOpenOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center px-8">
      <div className="text-center space-y-6 max-w-md">
        {/* Icon */}
        <div className="text-6xl">
          {getActivityEmoji(activity)}
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Opened in new tab</h2>
          <p className="text-white/60 line-clamp-2">{activity.title}</p>
        </div>

        {/* Continue button */}
        <button
          onClick={onDismiss}
          className="px-8 py-4 bg-white text-black font-semibold text-lg rounded-full transition-transform active:scale-95"
        >
          Continue browsing
        </button>

        {/* Future: More/Less like this buttons */}
        <div className="pt-4 flex gap-4 justify-center opacity-30">
          <button
            disabled
            className="px-6 py-3 border border-white/30 text-white/50 rounded-full text-sm"
          >
            More like this
          </button>
          <button
            disabled
            className="px-6 py-3 border border-white/30 text-white/50 rounded-full text-sm"
          >
            Less like this
          </button>
        </div>
        <p className="text-white/30 text-xs">Coming soon</p>
      </div>
    </div>
  )
}

function getActivityEmoji(activity: Activity): string {
  switch (activity.type) {
    case 'article':
      return '📰'
    case 'video':
      return '🎬'
    case 'tidal':
      return '🎵'
    case 'tidal-video':
      return '📺'
    case 'game':
      return (activity as any).emoji || '🎮'
    case 'app-link':
      return (activity as any).emoji || '📱'
    default:
      return '🔗'
  }
}

export const PostOpenOverlay = memo(PostOpenOverlayComponent)
