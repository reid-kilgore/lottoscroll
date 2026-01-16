export type ActivityType = 'article' | 'tidal' | 'tidal-video' | 'video' | 'app-link' | 'game'

export interface BaseActivity {
  id: string
  type: ActivityType
  title: string
  description?: string
  imageUrl?: string
  source: string
  tags?: string[]
  addedAt: number
}

export interface ArticleActivity extends BaseActivity {
  type: 'article'
  url: string
}

export interface TidalActivity extends BaseActivity {
  type: 'tidal'
  tidalUrl: string
  artist?: string
  albumArt?: string
}

export interface TidalVideoActivity extends BaseActivity {
  type: 'tidal-video'
  tidalUrl: string
  artist: string
  duration?: number
  explicit?: boolean
}

export interface VideoActivity extends BaseActivity {
  type: 'video'
  platform: 'nebula' | 'youtube'
  url: string
  embedId?: string
}

export interface AppLinkActivity extends BaseActivity {
  type: 'app-link'
  appScheme: string
  fallbackUrl?: string
  appName: string
}

export interface GameActivity extends BaseActivity {
  type: 'game'
  url: string
  gameName: string
}

export type Activity =
  | ArticleActivity
  | TidalActivity
  | TidalVideoActivity
  | VideoActivity
  | AppLinkActivity
  | GameActivity
