import express, { Request, Response } from 'express'
import cors from 'cors'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ACTIVITIES_PATH = path.join(__dirname, '../public/activities.json')

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

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
  artist?: string
  albumArt?: string
  platform?: 'nebula' | 'youtube'
  embedId?: string
}

interface ActivitiesData {
  activities: Activity[]
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}

function detectLinkType(url: string): { type: Activity['type']; source: string; platform?: 'nebula' | 'youtube'; embedId?: string } {
  const urlLower = url.toLowerCase()

  if (urlLower.includes('tidal.com')) {
    return { type: 'tidal', source: 'Tidal' }
  }
  if (urlLower.includes('nebula.tv') || urlLower.includes('watchnebula.com')) {
    return { type: 'video', source: 'Nebula', platform: 'nebula' }
  }
  if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
    const embedId = extractYouTubeId(url)
    return { type: 'video', source: 'YouTube', platform: 'youtube', embedId }
  }
  if (urlLower.includes('theparisreview.org')) return { type: 'article', source: 'Paris Review' }
  if (urlLower.includes('nybooks.com')) return { type: 'article', source: 'NYRB' }
  if (urlLower.includes('thecity.nyc')) return { type: 'article', source: 'THE CITY' }
  if (urlLower.includes('404media.co')) return { type: 'article', source: '404 Media' }
  if (urlLower.includes('aftermath.site')) return { type: 'article', source: 'Aftermath' }
  if (urlLower.includes('hellgatenyc.com')) return { type: 'article', source: 'Hell Gate' }

  try {
    return { type: 'article', source: new URL(url).hostname.replace('www.', '') }
  } catch {
    return { type: 'article', source: 'Unknown' }
  }
}

function extractYouTubeId(url: string): string | undefined {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/) ||
                url.match(/youtube\.com\/embed\/([^?\s]+)/)
  return match?.[1]
}

async function fetchPageTitle(url: string): Promise<string | null> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LottoScroll/1.0)' },
      signal: controller.signal
    })
    clearTimeout(timeout)
    const html = await response.text()
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    return titleMatch ? titleMatch[1].trim() : null
  } catch {
    return null
  }
}

function loadActivities(): ActivitiesData {
  try {
    return JSON.parse(fs.readFileSync(ACTIVITIES_PATH, 'utf-8'))
  } catch {
    return { activities: [] }
  }
}

function saveActivities(data: ActivitiesData): void {
  fs.writeFileSync(ACTIVITIES_PATH, JSON.stringify(data, null, 2))
}

// Routes
app.get('/', (_req: Request, res: Response) => {
  res.type('html').send(`<!DOCTYPE html>
<html>
<head>
  <title>LottoScroll - Add Content</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { box-sizing: border-box; }
    body { font-family: system-ui; max-width: 500px; margin: 0 auto; padding: 20px; background: #0a0a0a; color: #fff; }
    h1 { font-size: 1.5rem; margin-bottom: 1.5rem; }
    form { display: flex; flex-direction: column; gap: 1rem; }
    label { font-size: 0.875rem; color: #888; }
    input, textarea { width: 100%; padding: 12px; border: 1px solid #333; border-radius: 8px; font-size: 1rem; background: #1a1a1a; color: #fff; }
    input:focus, textarea:focus { outline: none; border-color: #0ea5e9; }
    button { padding: 14px; background: #0ea5e9; color: #000; border: none; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer; }
    button:hover { background: #38bdf8; }
    .success { color: #22c55e; margin-top: 1rem; }
    .error { color: #ef4444; margin-top: 1rem; }
    #detected { margin-top: 0.5rem; font-size: 0.875rem; color: #0ea5e9; }
  </style>
</head>
<body>
  <h1>Add to LottoScroll</h1>
  <form id="addForm">
    <div>
      <label>URL</label>
      <input type="url" name="url" id="urlInput" placeholder="Paste any link..." required>
      <div id="detected"></div>
    </div>
    <div>
      <label>Title (optional)</label>
      <input type="text" name="title" id="titleInput" placeholder="Auto-detected...">
    </div>
    <div>
      <label>Description (optional)</label>
      <textarea name="description" rows="2" placeholder="Brief description..."></textarea>
    </div>
    <div>
      <label>Tags (comma-separated)</label>
      <input type="text" name="tags" placeholder="music, chill, reading...">
    </div>
    <button type="submit">Add Content</button>
  </form>
  <div id="result"></div>
  <script>
    const urlInput = document.getElementById('urlInput');
    const detected = document.getElementById('detected');
    const titleInput = document.getElementById('titleInput');
    let debounce;
    urlInput.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(async () => {
        const url = urlInput.value;
        if (!url) { detected.textContent = ''; return; }
        try {
          const res = await fetch('/api/detect?url=' + encodeURIComponent(url));
          const data = await res.json();
          detected.textContent = 'Detected: ' + data.type + ' from ' + data.source;
          if (data.title && !titleInput.value) titleInput.placeholder = data.title;
        } catch {}
      }, 300);
    });
    document.getElementById('addForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = e.target;
      const data = {
        url: form.url.value,
        title: form.title.value || undefined,
        description: form.description.value || undefined,
        tags: form.tags.value ? form.tags.value.split(',').map(t => t.trim()) : undefined
      };
      const res = await fetch('/api/add', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const result = await res.json();
      const resultDiv = document.getElementById('result');
      if (result.success) {
        resultDiv.innerHTML = '<p class="success">Added: ' + result.activity.title + '</p>';
        form.reset(); detected.textContent = ''; titleInput.placeholder = 'Auto-detected...';
      } else {
        resultDiv.innerHTML = '<p class="error">Error: ' + result.error + '</p>';
      }
    });
  </script>
</body>
</html>`)
})

app.get('/api/detect', async (req: Request, res: Response) => {
  const url = req.query.url as string
  if (!url) { res.json({ error: 'No URL' }); return }
  const detected = detectLinkType(url)
  const title = await fetchPageTitle(url)
  res.json({ ...detected, title })
})

app.get('/api/activities', (_req: Request, res: Response) => {
  res.json(loadActivities())
})

app.post('/api/add', async (req: Request, res: Response) => {
  const { url, title, description, tags } = req.body
  if (!url) { res.json({ success: false, error: 'URL required' }); return }

  const detected = detectLinkType(url)
  const autoTitle = title || await fetchPageTitle(url) || 'Untitled'

  const activity: Activity = {
    id: generateId(),
    type: detected.type,
    title: autoTitle,
    source: detected.source,
    addedAt: Date.now(),
  }

  if (description) activity.description = description
  if (tags?.length) activity.tags = tags

  if (detected.type === 'tidal') {
    activity.tidalUrl = url
  } else if (detected.type === 'video') {
    activity.url = url
    activity.platform = detected.platform
    if (detected.embedId) activity.embedId = detected.embedId
  } else {
    activity.url = url
  }

  const data = loadActivities()
  data.activities.unshift(activity)
  saveActivities(data)

  res.json({ success: true, activity })
})

app.delete('/api/activities/:id', (req: Request, res: Response) => {
  const data = loadActivities()
  const idx = data.activities.findIndex(a => a.id === req.params.id)
  if (idx === -1) { res.json({ success: false, error: 'Not found' }); return }
  data.activities.splice(idx, 1)
  saveActivities(data)
  res.json({ success: true })
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Content server: http://localhost:${PORT}`)
})
