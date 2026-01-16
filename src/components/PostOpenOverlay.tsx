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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center px-6">
      {/* Dialog card */}
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
        {/* Header with icon and checkmark */}
        <div className="bg-zinc-800 px-6 py-5 border-b border-zinc-700">
          <div className="flex items-center gap-4">
            <div className="text-4xl">{getActivityEmoji(activity)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-green-400 text-lg">✓</span>
                <h2 className="text-lg font-semibold text-white">Opened</h2>
              </div>
              <p className="text-zinc-400 text-sm truncate">{activity.source}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <p className="text-white/80 text-sm line-clamp-2 leading-relaxed">{activity.title}</p>
        </div>

        {/* Preference buttons */}
        <div className="px-6 pb-4">
          <p className="text-zinc-500 text-xs mb-3 uppercase tracking-wide font-medium">
            Adjust preferences
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleMore}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-white rounded-xl text-sm font-medium transition-all active:scale-[0.98]"
            >
              <span className="text-green-400">▲</span>
              More like this
            </button>
            <button
              onClick={handleLess}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-white rounded-xl text-sm font-medium transition-all active:scale-[0.98]"
            >
              <span className="text-red-400">▼</span>
              Less like this
            </button>
          </div>
        </div>

        {/* Continue button */}
        <div className="px-6 pb-6">
          <button
            onClick={onDismiss}
            className="w-full py-4 bg-white hover:bg-zinc-100 text-black font-semibold text-base rounded-xl transition-all active:scale-[0.98] shadow-lg"
          >
            Continue browsing
          </button>
        </div>
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
