import Parser from 'rss-parser'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const POOL_DIR = path.join(__dirname, '../.pool')

interface FeedConfig {
  url: string
  source: string
  type: 'article' | 'video'
  platform?: 'nebula' | 'youtube'
  tags?: string[]
}

interface Activity {
  id: string
  type: 'article' | 'video'
  title: string
  description?: string
  url: string
  imageUrl?: string
  source: string
  tags?: string[]
  addedAt: number
  platform?: 'nebula' | 'youtube'
}

// Nebula channels you follow
const NEBULA_CHANNELS = [
  'bigjoel', 'dex', 'foamparty', 'jacob-geller', 'ladyemily',
  'lauracrone', 'lilyalexandre', 'lindsayellis', 'littlejoel',
  'mancarryingthing', 'munecat', 'overvieweffekt', 'philosophytube',
  'princessweekes', 'raz', 'razbuten', 'sarah-z-debater-theater',
  'sarahz', 'theprince', 'watchcinemaofmeaning'
]

const ARTICLE_FEEDS: FeedConfig[] = [
  {
    url: 'https://www.theparisreview.org/blog/feed/',
    source: 'Paris Review',
    type: 'article',
    tags: ['reading', 'essays']
  },
  {
    url: 'https://feeds.feedburner.com/nybooks',
    source: 'NYRB',
    type: 'article',
    tags: ['reading', 'essays']
  },
  {
    url: 'https://www.thecity.nyc/feed',
    source: 'THE CITY',
    type: 'article',
    tags: ['nyc', 'news']
  },
  {
    url: 'https://simonwillison.net/atom/everything/',
    source: 'Simon Willison',
    type: 'article',
    tags: ['tech', 'ai']
  },
  {
    url: 'https://itscharlibb.substack.com/feed',
    source: 'charli bb',
    type: 'article',
    tags: ['blog']
  },
  {
    url: 'https://hnrss.org/frontpage?points=100',
    source: 'Hacker News',
    type: 'article',
    tags: ['tech', 'news']
  },
  {
    url: 'https://lobste.rs/rss',
    source: 'Lobsters',
    type: 'article',
    tags: ['tech', 'programming']
  }
]

// Generate Nebula channel feeds
const NEBULA_FEEDS: FeedConfig[] = NEBULA_CHANNELS.map(slug => ({
  url: `https://rss.nebula.app/video/channels/${slug}.rss`,
  source: slug,
  type: 'video' as const,
  platform: 'nebula' as const,
  tags: ['video', 'learning']
}))

const FEEDS: FeedConfig[] = [...ARTICLE_FEEDS, ...NEBULA_FEEDS]

const parser = new Parser({
  timeout: 15000,
  headers: {
    'User-Agent': 'LottoScroll/1.0 (RSS Reader)'
  }
})

function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}

function extractImageFromContent(content: string | undefined): string | undefined {
  if (!content) return undefined
  const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/)
  return imgMatch?.[1]
}

function cleanDescription(text: string | undefined): string | undefined {
  if (!text) return undefined
  // Remove HTML tags and limit length
  return text
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 200)
}

async function fetchFeed(config: FeedConfig): Promise<Activity[]> {
  try {
    console.log(`Fetching ${config.source}...`)
    const feed = await parser.parseURL(config.url)

    const items = feed.items.slice(0, 50).map(item => {
      const activity: Activity = {
        id: generateId(),
        type: config.type,
        title: item.title || 'Untitled',
        description: cleanDescription(item.contentSnippet || item.content),
        url: item.link || '',
        source: config.source,
        tags: config.tags,
        addedAt: item.pubDate ? new Date(item.pubDate).getTime() : Date.now(),
        imageUrl: item.enclosure?.url || extractImageFromContent(item.content)
      }

      if (config.platform) {
        activity.platform = config.platform
      }

      return activity
    }).filter(a => a.url) // Only keep items with valid URLs

    console.log(`  Got ${items.length} items from ${config.source}`)
    return items
  } catch (error) {
    console.error(`  Failed to fetch ${config.source}:`, error instanceof Error ? error.message : error)
    return []
  }
}

function dedupeByUrl(activities: Activity[]): Activity[] {
  const seen = new Set<string>()
  return activities.filter(a => {
    if (seen.has(a.url)) return false
    seen.add(a.url)
    return true
  })
}

async function main() {
  console.log('Starting RSS scrape...\n')

  // Ensure pool directory exists
  if (!fs.existsSync(POOL_DIR)) {
    fs.mkdirSync(POOL_DIR, { recursive: true })
  }

  // Fetch all feeds in parallel
  const results = await Promise.all(FEEDS.map(fetchFeed))
  const allItems = results.flat()

  // Dedupe
  const deduped = dedupeByUrl(allItems)
  console.log(`\nTotal items: ${allItems.length}, after dedupe: ${deduped.length}`)

  // Separate by type
  const articles = deduped.filter(a => a.type === 'article')
  const videos = deduped.filter(a => a.type === 'video')

  // Save to pool
  const outputPath = path.join(POOL_DIR, 'articles.json')
  fs.writeFileSync(outputPath, JSON.stringify({
    scraped_at: new Date().toISOString(),
    articles,
    videos
  }, null, 2))

  console.log(`\nSaved to ${outputPath}`)
  console.log(`  Articles: ${articles.length}`)
  console.log(`  Videos: ${videos.length}`)
}

main().catch(console.error)
