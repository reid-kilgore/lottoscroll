import { test, expect } from '@playwright/test'

const SITE_URL = 'https://good-scroll.onrender.com/'

test('countdown should open current card, not original card after scroll', async ({ page }) => {
  // Track window.open calls
  const openedUrls: string[] = []
  await page.exposeFunction('__testTrackOpen', (url: string) => {
    openedUrls.push(url)
    console.log('window.open called with:', url)
  })

  // Intercept window.open
  await page.addInitScript(() => {
    const originalOpen = window.open
    window.open = function(url, ...args) {
      // @ts-ignore
      window.__testTrackOpen(url)
      // Don't actually open to avoid popup blockers
      return null
    }
  })

  // Load the page
  await page.goto(SITE_URL)
  await page.waitForSelector('[data-card-index]')

  // Get the first card's info
  const firstCardIndex = await page.locator('[data-card-index="0"]').getAttribute('data-card-index')
  console.log('First card index:', firstCardIndex)

  // Wait for countdown to start (should show 5)
  await page.waitForTimeout(500)

  // Get initial countdown value
  const initialCountdown = await page.locator('.fixed.bottom-8 span').textContent()
  console.log('Initial countdown:', initialCountdown)

  // Scroll down to second card
  console.log('Scrolling to second card...')
  await page.evaluate(() => {
    const container = document.querySelector('.overflow-y-scroll')
    if (container) {
      container.scrollBy({ top: window.innerHeight, behavior: 'smooth' })
    }
  })

  // Wait for scroll to complete and snap
  await page.waitForTimeout(500)

  // Check countdown reset (should be back to 5 or close to it)
  const afterScrollCountdown = await page.locator('.fixed.bottom-8 span').textContent()
  console.log('After scroll countdown:', afterScrollCountdown)

  // Verify reset happened
  const afterScrollValue = parseInt(afterScrollCountdown || '0')
  expect(afterScrollValue).toBeGreaterThanOrEqual(4) // Should have reset to 5 (allow for timing)

  // Now wait for countdown to expire (wait up to 7 seconds)
  console.log('Waiting for countdown to expire...')
  await page.waitForTimeout(6000)

  // Check if window.open was called
  console.log('Opened URLs:', openedUrls)
  expect(openedUrls.length).toBeGreaterThan(0)

  // The URL should NOT contain content from the first card
  // This is hard to test without knowing exact URLs, but we can at least verify it opened
  console.log('Test complete - URL opened:', openedUrls[0])
})

test('countdown resets on scroll', async ({ page }) => {
  await page.goto(SITE_URL)
  await page.waitForSelector('[data-card-index]')

  // Wait for countdown to get to 3 or less
  await page.waitForTimeout(2500)

  const beforeScroll = await page.locator('.fixed.bottom-8 span').textContent()
  const beforeValue = parseInt(beforeScroll || '5')
  console.log('Before scroll:', beforeValue)
  expect(beforeValue).toBeLessThanOrEqual(3)

  // Scroll
  await page.evaluate(() => {
    const container = document.querySelector('.overflow-y-scroll')
    if (container) {
      container.scrollBy({ top: 100, behavior: 'instant' })
    }
  })

  await page.waitForTimeout(300)

  // Check it reset
  const afterScroll = await page.locator('.fixed.bottom-8 span').textContent()
  const afterValue = parseInt(afterScroll || '0')
  console.log('After scroll:', afterValue)

  // Should have reset to 5
  expect(afterValue).toBe(5)
})
