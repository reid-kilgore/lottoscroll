import { useRef, useState, useCallback } from 'react'
import { useActivities } from '../../hooks/useActivities'
import { useAutoOpen } from '../../hooks/useAutoOpen'
import { useVisibleCard } from '../../hooks/useVisibleCard'
import { useScrollState } from '../../hooks/useScrollState'
import { usePreferences } from '../../hooks/usePreferences'
import { openActivity } from '../../utils/openActivity'
import { FeedCard } from './FeedCard'
import { CountdownOverlay } from '../CountdownOverlay'
import { PostOpenOverlay } from '../PostOpenOverlay'

const COUNTDOWN_DURATION = 5000 // 5 seconds

export function Feed() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [showPostOpen, setShowPostOpen] = useState(false)

  // Preferences for weighted sampling
  const { getWeight, likeSource, dislikeSource } = usePreferences()

  // Load activities with preference weights
  const { activities, isLoading, error } = useActivities({ getWeight })

  // Detect which card is visible
  const currentIndex = useVisibleCard(containerRef)

  // Detect if user is scrolling
  const isScrolling = useScrollState(containerRef)

  // Get current activity
  const currentActivity = activities[currentIndex]

  // Handle auto-open (from countdown timer)
  const handleAutoOpen = useCallback(() => {
    if (currentActivity) {
      openActivity(currentActivity)
      setShowPostOpen(true)
    }
  }, [currentActivity])

  // Handle manual click (card already opens the link)
  const handleCardClick = useCallback(() => {
    setShowPostOpen(true)
  }, [])

  // Countdown timer
  const countdown = useAutoOpen({
    duration: COUNTDOWN_DURATION,
    onOpen: handleAutoOpen,
    isPaused: isScrolling || showPostOpen || isLoading,
    isScrolling,
    resetKey: currentIndex
  })

  // Dismiss post-open overlay
  const handleDismiss = useCallback(() => {
    setShowPostOpen(false)
    countdown.reset()
  }, [countdown])

  // Handle more/less like this
  const handleMoreLikeThis = useCallback(() => {
    if (currentActivity) {
      likeSource(currentActivity.source)
    }
  }, [currentActivity, likeSource])

  const handleLessLikeThis = useCallback(() => {
    if (currentActivity) {
      dislikeSource(currentActivity.source)
    }
  }, [currentActivity, dislikeSource])

  if (isLoading) {
    return (
      <div className="h-dvh w-full flex items-center justify-center bg-black">
        <div className="text-white/60 text-lg">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-dvh w-full flex items-center justify-center bg-black">
        <div className="text-red-400 text-lg">{error}</div>
      </div>
    )
  }

  return (
    <>
      <div
        ref={containerRef}
        className="h-dvh w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
      >
        {activities.map((activity, index) => (
          <FeedCard key={activity.id} activity={activity} index={index} onOpen={handleCardClick} />
        ))}
      </div>

      {/* Countdown overlay - hide when post-open is showing */}
      {!showPostOpen && (
        <CountdownOverlay
          secondsLeft={countdown.secondsLeft}
          isPaused={countdown.isPaused}
        />
      )}

      {/* Post-open overlay */}
      {showPostOpen && currentActivity && (
        <PostOpenOverlay
          activity={currentActivity}
          onDismiss={handleDismiss}
          onMoreLikeThis={handleMoreLikeThis}
          onLessLikeThis={handleLessLikeThis}
        />
      )}
    </>
  )
}
