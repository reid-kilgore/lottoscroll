import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const POOL_DIR = path.join(__dirname, '../.pool')
const OUTPUT_PATH = path.join(__dirname, '../public/activities.json')

// Seeded random number generator (mulberry32)
function seededRandom(seed: number) {
  return function() {
    let t = seed += 0x6D2B79F5
    t = Math.imul(t ^ t >>> 15, t | 1)
    t ^= t + Math.imul(t ^ t >>> 7, t | 61)
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

// Convert date string to seed number
function dateToSeed(dateStr: string): number {
  return dateStr.split('').reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0)
  }, 0)
}

// Shuffle array with seeded random
function shuffle<T>(array: T[], random: () => number): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

// Sample n items from array with seeded random
function sample<T>(array: T[], n: number, random: () => number): T[] {
  const shuffled = shuffle(array, random)
  return shuffled.slice(0, Math.min(n, array.length))
}

interface Activity {
  id: string
  type: string
  title: string
  [key: string]: unknown
}

interface PoolData {
  articles?: Activity[]
  videos?: Activity[]
  tracks?: Activity[]
}

async function main() {
  const today = new Date().toISOString().split('T')[0]
  console.log(`Generating daily feed for ${today}...\n`)

  const seed = dateToSeed(today)
  const random = seededRandom(seed)

  // Load pool files
  const articlesPath = path.join(POOL_DIR, 'articles.json')
  const tidalVideosPath = path.join(POOL_DIR, 'tidal-videos.json')
  const gamesPath = path.join(POOL_DIR, 'games.json')

  let articles: Activity[] = []
  let nebulaVideos: Activity[] = []
  let tidalVideos: Activity[] = []
  let games: Activity[] = []

  if (fs.existsSync(articlesPath)) {
    const data = JSON.parse(fs.readFileSync(articlesPath, 'utf-8'))
    articles = data.articles || []
    nebulaVideos = data.videos || []
    console.log(`Loaded ${articles.length} articles, ${nebulaVideos.length} Nebula videos from pool`)
  } else {
    console.log('No articles.json found in pool')
  }

  if (fs.existsSync(tidalVideosPath)) {
    const data = JSON.parse(fs.readFileSync(tidalVideosPath, 'utf-8'))
    tidalVideos = data.videos || []
    console.log(`Loaded ${tidalVideos.length} Tidal music videos from pool`)
  } else {
    console.log('No tidal-videos.json found in pool (run: python scripts/fetch-tidal-videos.py)')
  }

  if (fs.existsSync(gamesPath)) {
    const data = JSON.parse(fs.readFileSync(gamesPath, 'utf-8'))
    games = data.games || []
    console.log(`Loaded ${games.length} evergreen games`)
  }

  // Load evergreen videos (Crash Course, etc.)
  const evergreenVideosPath = path.join(POOL_DIR, 'evergreen-videos.json')
  let evergreenVideos: Activity[] = []
  if (fs.existsSync(evergreenVideosPath)) {
    const data = JSON.parse(fs.readFileSync(evergreenVideosPath, 'utf-8'))
    evergreenVideos = data.videos || []
    console.log(`Loaded ${evergreenVideos.length} evergreen videos`)
  }

  // Target: ~40 cards
  // Ratio: 45% articles, 40% tidal music videos, 15% nebula
  const TARGET_TOTAL = 40
  const articleCount = Math.round(TARGET_TOTAL * 0.45)
  const tidalVideoCount = Math.round(TARGET_TOTAL * 0.40)
  const nebulaCount = Math.round(TARGET_TOTAL * 0.15)

  console.log(`\nSampling: ${articleCount} articles, ${tidalVideoCount} tidal videos, ${nebulaCount} nebula`)

  // Sample from each pool
  const sampledArticles = sample(articles, articleCount, random)
  const sampledTidalVideos = sample(tidalVideos, tidalVideoCount, random)
  const sampledNebula = sample(nebulaVideos, nebulaCount, random)

  console.log(`Got: ${sampledArticles.length} articles, ${sampledTidalVideos.length} tidal videos, ${sampledNebula.length} nebula`)

  // Combine all content (client-side will shuffle on page load)
  const final = [
    ...sampledArticles,
    ...sampledTidalVideos,
    ...sampledNebula,
    ...games,
    ...evergreenVideos
  ]

  console.log(`\nTotal activities: ${final.length} (including ${games.length} games, ${evergreenVideos.length} evergreen videos)`)

  // Write output
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(final, null, 2))
  console.log(`Saved to ${OUTPUT_PATH}`)

  // Show preview
  console.log('\nFirst 5 items:')
  final.slice(0, 5).forEach((item, i) => {
    console.log(`  ${i + 1}. [${item.type}] ${item.title}`)
  })
}

main().catch(console.error)
