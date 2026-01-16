import { test, expect } from '@playwright/test'

const SITE_URL = 'https://good-scroll.onrender.com/'

test('content is different on each page load', async ({ browser }) => {
  const loadTitles = async (): Promise<string[]> => {
    const context = await browser.newContext()
    const page = await context.newPage()
    await page.goto(SITE_URL)
    await page.waitForSelector('[data-card-index]')

    // Get first 5 card titles
    const titles = await page.evaluate(() => {
      const cards = document.querySelectorAll('[data-card-index]')
      return Array.from(cards).slice(0, 5).map(card => {
        const h2 = card.querySelector('h2')
        return h2?.textContent || 'unknown'
      })
    })

    await context.close()
    return titles
  }

  // Load page 3 times
  console.log('Loading page 3 times to check randomization...\n')

  const load1 = await loadTitles()
  console.log('Load 1:', load1)

  const load2 = await loadTitles()
  console.log('Load 2:', load2)

  const load3 = await loadTitles()
  console.log('Load 3:', load3)

  // Check that at least some titles are different between loads
  const allSame12 = load1.every((t, i) => t === load2[i])
  const allSame23 = load2.every((t, i) => t === load3[i])
  const allSame13 = load1.every((t, i) => t === load3[i])

  console.log('\nComparison:')
  console.log('Load 1 === Load 2:', allSame12)
  console.log('Load 2 === Load 3:', allSame23)
  console.log('Load 1 === Load 3:', allSame13)

  // At least one pair should be different
  const hasDifference = !allSame12 || !allSame23 || !allSame13
  expect(hasDifference).toBe(true)

  console.log('\nRandomization working:', hasDifference ? 'YES' : 'NO')
})
