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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
      {/* Dialog card */}
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl max-w-sm w-full">
        {/* Header */}
        <div className="bg-zinc-800 p-5 rounded-t-2xl border-b border-zinc-700">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-zinc-700 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
              {getActivityEmoji(activity)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-green-400">✓</span>
                <span className="text-white font-semibold">Opened</span>
              </div>
              <p className="text-zinc-400 text-sm truncate">{activity.source}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 border-b border-zinc-800">
          <p className="text-white text-base leading-relaxed line-clamp-2">{activity.title}</p>
        </div>

        {/* Preference buttons */}
        <div className="p-5 space-y-3">
          <p className="text-zinc-500 text-xs uppercase tracking-wider font-medium">
            Adjust preferences
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleMore}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-white rounded-xl text-sm font-medium transition-all active:scale-[0.98]"
            >
              <span className="text-green-400">▲</span>
              More like this
            </button>
            <button
              onClick={handleLess}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-white rounded-xl text-sm font-medium transition-all active:scale-[0.98]"
            >
              <span className="text-red-400">▼</span>
              Less like this
            </button>
          </div>
        </div>

        {/* Continue button */}
        <div className="p-5 pt-0">
          <button
            onClick={onDismiss}
            className="w-full py-4 bg-white hover:bg-zinc-100 text-black font-semibold text-base rounded-xl transition-all active:scale-[0.98]"
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
