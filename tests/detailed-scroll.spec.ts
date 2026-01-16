import { test, expect } from '@playwright/test'

const SITE_URL = 'https://good-scroll.onrender.com/'

test('detailed scroll and reset check', async ({ page }) => {
  await page.goto(SITE_URL)
  await page.waitForSelector('[data-card-index]')

  // Let countdown tick to 3
  console.log('Waiting for countdown to reach 3...')
  await page.waitForTimeout(2500)

  const before = await page.locator('.fixed.bottom-8 span').textContent()
  console.log('T+0ms: countdown =', before)

  // Scroll
  await page.evaluate(() => {
    const container = document.querySelector('.overflow-y-scroll')
    if (container) container.scrollBy({ top: 300, behavior: 'instant' })
  })

  // Check immediately
  await page.waitForTimeout(50)
  const t50 = await page.locator('.fixed.bottom-8 span').textContent()
  console.log('T+50ms: countdown =', t50)

  await page.waitForTimeout(100)
  const t150 = await page.locator('.fixed.bottom-8 span').textContent()
  console.log('T+150ms: countdown =', t150)

  await page.waitForTimeout(100)
  const t250 = await page.locator('.fixed.bottom-8 span').textContent()
  console.log('T+250ms: countdown =', t250)

  await page.waitForTimeout(100)
  const t350 = await page.locator('.fixed.bottom-8 span').textContent()
  console.log('T+350ms: countdown =', t350)

  // By now, isScrolling should have gone true then false (150ms debounce)
  // If reset worked, countdown should be 5 or 4 (accounting for time passed)
  const finalValue = parseInt(t350 || '0')
  console.log('Final value:', finalValue, '- should be >= 4 if reset worked')
})

test('check if scroll triggers state change', async ({ page }) => {
  // Inject debugging into React components
  await page.addInitScript(() => {
    // Monkey-patch to log state changes
    const originalSetState = window.React?.useState
    window.__stateChanges = []
  })

  await page.goto(SITE_URL)
  await page.waitForSelector('[data-card-index]')

  // Get the container and check its scroll handler
  const hasScrollListener = await page.evaluate(() => {
    const container = document.querySelector('.overflow-y-scroll')
    // Try to trigger scroll and see what happens
    if (container) {
      const event = new Event('scroll', { bubbles: true })
      container.dispatchEvent(event)
      return true
    }
    return false
  })
  console.log('Manual scroll event dispatched:', hasScrollListener)

  await page.waitForTimeout(500)

  // Now do actual scroll
  await page.evaluate(() => {
    const container = document.querySelector('.overflow-y-scroll')
    if (container) {
      container.scrollTop = 500
    }
  })

  console.log('Set scrollTop = 500')
  await page.waitForTimeout(500)

  const countdown = await page.locator('.fixed.bottom-8 span').textContent()
  console.log('Countdown after scroll:', countdown)
})
