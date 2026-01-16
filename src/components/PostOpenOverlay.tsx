import { memo } from 'react'
import type { Activity } from '../types/activity'

interface PostOpenOverlayProps {
  activity: Activity
  onDismiss: () => void
  onMoreLikeThis: () => void
  onLessLikeThis: () => void
}

function PostOpenOverlayComponent({
  activity,
  onDismiss,
  onMoreLikeThis,
  onLessLikeThis
}: PostOpenOverlayProps) {
  const handleMore = () => {
    onMoreLikeThis()
    onDismiss()
  }

  const handleLess = () => {
    onLessLikeThis()
    onDismiss()
  }

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
          <p className="text-white/40 text-sm">{activity.source}</p>
        </div>

        {/* More/Less buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={handleMore}
            className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-full text-sm font-medium transition-colors active:scale-95"
          >
            More like this
          </button>
          <button
            onClick={handleLess}
            className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-full text-sm font-medium transition-colors active:scale-95"
          >
            Less like this
          </button>
        </div>

        {/* Continue button */}
        <button
          onClick={onDismiss}
          className="px-8 py-4 bg-white text-black font-semibold text-lg rounded-full transition-transform active:scale-95"
        >
          Continue browsing
        </button>

        <p className="text-white/30 text-xs">
          Preferences apply on next page load
        </p>
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
