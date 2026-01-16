import { test, expect } from '@playwright/test'

const SITE_URL = 'https://good-scroll.onrender.com/'

test('debug scroll detection', async ({ page }) => {
  // Add debugging to track scroll events
  await page.addInitScript(() => {
    window.__scrollEvents = []
    const originalAddEventListener = HTMLElement.prototype.addEventListener
    HTMLElement.prototype.addEventListener = function(type, listener, options) {
      if (type === 'scroll') {
        const wrappedListener = (e) => {
          window.__scrollEvents.push({ time: Date.now(), target: e.target?.className })
          console.log('SCROLL EVENT:', e.target?.className)
          return listener.call(this, e)
        }
        return originalAddEventListener.call(this, type, wrappedListener, options)
      }
      return originalAddEventListener.call(this, type, listener, options)
    }
  })

  await page.goto(SITE_URL)
  await page.waitForSelector('[data-card-index]')

  // Wait a bit for timer to tick
  await page.waitForTimeout(1000)

  const countdown1 = await page.locator('.fixed.bottom-8 span').textContent()
  console.log('Before scroll countdown:', countdown1)

  // Try different scroll methods
  console.log('Attempting scroll...')

  // Method 1: scrollBy on container
  await page.evaluate(() => {
    const container = document.querySelector('.overflow-y-scroll')
    console.log('Container found:', !!container)
    if (container) {
      container.scrollBy({ top: 200, behavior: 'instant' })
      console.log('scrollBy executed, scrollTop:', container.scrollTop)
    }
  })

  await page.waitForTimeout(100)

  // Check scroll events
  const scrollEvents = await page.evaluate(() => window.__scrollEvents)
  console.log('Scroll events captured:', scrollEvents.length)

  // Check scroll position
  const scrollTop = await page.evaluate(() => {
    const container = document.querySelector('.overflow-y-scroll')
    return container?.scrollTop
  })
  console.log('Scroll position after:', scrollTop)

  await page.waitForTimeout(300)

  const countdown2 = await page.locator('.fixed.bottom-8 span').textContent()
  console.log('After scroll countdown:', countdown2)

  // The countdown should have reset to 5
  expect(parseInt(countdown2 || '0')).toBeGreaterThanOrEqual(4)
})
