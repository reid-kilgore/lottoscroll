import Parser from 'rss-parser'
import * as fs from 'fs'
import * as path from 'path'

interface Activity {
  id: string
  type: 'article' | 'tidal' | 'video' | 'app-link'
  title: string
  description?: string
  imageUrl?: string
  source: string
  tags?: string[]
  addedAt: number
  url?: string
  tidalUrl?: string
  platform?: string
}

interface ActivitiesData {
  activities: Activity[]
}

const RSS_FEEDS = [
  {
    url: 'https://www.theparisreview.org/blog/feed',
    source: 'Paris Review',
    tags: ['reading', 'essays']
  },
  {
    url: 'https://feeds.feedburner.com/nybooks',
    source: 'NYRB',
    tags: ['reading', 'essays']
  },
  {
    url: 'https://www.thecity.nyc/feed',
    source: 'THE CITY',
    tags: ['nyc', 'news']
  },
  {
    url: 'https://rss.nebula.app/video.rss',
    source: 'Nebula',
    tags: ['video', 'learning'],
    type: 'video' as const,
    platform: 'nebula'
  }
]

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'LottoScroll/1.0'
  }
})

function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}

function extractImageFromContent(content: string): string | undefined {
  const imgMatch = content?.match(/<img[^>]+src="([^"]+)"/)
  return imgMatch?.[1]
}

async function fetchFeed(feedConfig: typeof RSS_FEEDS[0]): Promise<Activity[]> {
  try {
    console.log(`Fetching ${feedConfig.source}...`)
    const feed = await parser.parseURL(feedConfig.url)

    return feed.items.slice(0, 10).map(item => {
      const activity: Activity = {
        id: generateId(),
        type: feedConfig.type || 'article',
        title: item.title || 'Untitled',
        description: item.contentSnippet?.substring(0, 150),
        url: item.link,
        source: feedConfig.source,
        tags: feedConfig.tags,
        addedAt: item.pubDate ? new Date(item.pubDate).getTime() : Date.now(),
        imageUrl: item.enclosure?.url || extractImageFromContent(item.content || '')
      }

      if (feedConfig.platform) {
        activity.platform = feedConfig.platform
      }

      return activity
    })
  } catch (error) {
    console.error(`Failed to fetch ${feedConfig.source}:`, error)
    return []
  }
}

async function main() {
  const activitiesPath = path.join(__dirname, '../public/activities.json')

  // Load existing activities
  let existingData: ActivitiesData = { activities: [] }
  try {
    const content = fs.readFileSync(activitiesPath, 'utf-8')
    existingData = JSON.parse(content)
  } catch {
    console.log('No existing activities.json found, creating new one')
  }

  // Get existing URLs to avoid duplicates
  const existingUrls = new Set(
    existingData.activities
      .map(a => a.url || a.tidalUrl)
      .filter(Boolean)
  )

  // Fetch all feeds
  const allNewActivities: Activity[] = []

  for (const feedConfig of RSS_FEEDS) {
    const activities = await fetchFeed(feedConfig)
    const newActivities = activities.filter(a => !existingUrls.has(a.url))
    allNewActivities.push(...newActivities)
    console.log(`  Got ${newActivities.length} new items from ${feedConfig.source}`)
  }

  // Merge with existing, keeping manual entries
  const manualEntries = existingData.activities.filter(
    a => a.type === 'tidal' || a.type === 'app-link' || !a.url?.includes('.')
  )

  const merged: ActivitiesData = {
    activities: [
      ...manualEntries,
      ...allNewActivities,
      ...existingData.activities.filter(a =>
        !manualEntries.includes(a) &&
        !allNewActivities.some(n => n.url === a.url)
      )
    ]
  }

  // Sort by addedAt descending
  merged.activities.sort((a, b) => b.addedAt - a.addedAt)

  // Write back
  fs.writeFileSync(activitiesPath, JSON.stringify(merged, null, 2))
  console.log(`\nTotal activities: ${merged.activities.length}`)
  console.log(`Saved to ${activitiesPath}`)
}

main().catch(console.error)
