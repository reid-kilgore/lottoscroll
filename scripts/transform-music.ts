import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const POOL_DIR = path.join(__dirname, '../.pool')

interface FavoritedTrack {
  title: string
  track_id: number
  added: string
}

interface Release {
  id: string
  title: string
  artist: string
  cover_url: string
  type: 'ALBUM' | 'SINGLE' | 'EP'
  favorited_tracks: FavoritedTrack[]
  popularity: number
  explicit: boolean
}

interface MusicLibrary {
  generated_at: string
  releases: Release[]
}

interface TidalActivity {
  id: string
  type: 'tidal'
  title: string
  artist: string
  albumTitle: string
  tidalUrl: string
  albumArt: string
  source: string
  addedAt: number
  popularity: number
  explicit: boolean
}

function transformMusic(library: MusicLibrary): TidalActivity[] {
  const activities: TidalActivity[] = []

  for (const release of library.releases) {
    if (!release.favorited_tracks || release.favorited_tracks.length === 0) {
      continue
    }

    for (const track of release.favorited_tracks) {
      activities.push({
        id: `tidal-${track.track_id}`,
        type: 'tidal',
        title: track.title,
        artist: release.artist,
        albumTitle: release.title,
        tidalUrl: `https://tidal.com/browse/track/${track.track_id}`,
        albumArt: release.cover_url,
        source: 'Tidal',
        addedAt: new Date(track.added).getTime(),
        popularity: release.popularity,
        explicit: release.explicit
      })
    }
  }

  return activities
}

async function main() {
  console.log('Transforming music.json...\n')

  // Read music.json
  const musicPath = path.join(__dirname, '../music.json')
  if (!fs.existsSync(musicPath)) {
    console.error('music.json not found!')
    process.exit(1)
  }

  const library: MusicLibrary = JSON.parse(fs.readFileSync(musicPath, 'utf-8'))
  console.log(`Found ${library.releases.length} releases`)

  // Transform to activities
  const activities = transformMusic(library)
  console.log(`Extracted ${activities.length} favorited tracks`)

  // Ensure pool directory exists
  if (!fs.existsSync(POOL_DIR)) {
    fs.mkdirSync(POOL_DIR, { recursive: true })
  }

  // Save to pool
  const outputPath = path.join(POOL_DIR, 'tidal.json')
  fs.writeFileSync(outputPath, JSON.stringify({
    generated_at: new Date().toISOString(),
    source_generated_at: library.generated_at,
    tracks: activities
  }, null, 2))

  console.log(`\nSaved to ${outputPath}`)

  // Stats
  const byArtist = activities.reduce((acc, t) => {
    acc[t.artist] = (acc[t.artist] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  console.log('\nTop artists:')
  Object.entries(byArtist)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .forEach(([artist, count]) => console.log(`  ${artist}: ${count} tracks`))
}

main().catch(console.error)
