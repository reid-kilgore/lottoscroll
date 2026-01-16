import { test, expect } from '@playwright/test'

const SITE_URL = 'http://localhost:5173'

test('local: countdown resets on scroll', async ({ page }) => {
  await page.goto(SITE_URL)
  await page.waitForSelector('[data-card-index]')

  // Let countdown tick to 3
  console.log('Waiting for countdown to reach 3...')
  await page.waitForTimeout(2500)

  const before = await page.locator('.fixed.bottom-8 span').textContent()
  console.log('Before scroll:', before)
  expect(parseInt(before || '5')).toBeLessThanOrEqual(3)

  // Scroll
  await page.evaluate(() => {
    const container = document.querySelector('.overflow-y-scroll')
    if (container) container.scrollBy({ top: 300, behavior: 'instant' })
  })

  // Wait for scroll state to update and reset to happen
  await page.waitForTimeout(50)
  const immediateAfter = await page.locator('.fixed.bottom-8 span').textContent()
  console.log('Immediate after scroll:', immediateAfter)

  await page.waitForTimeout(200)
  const after = await page.locator('.fixed.bottom-8 span').textContent()
  console.log('After scroll (200ms later):', after)

  // Should have reset to 5
  expect(parseInt(after || '0')).toBeGreaterThanOrEqual(4)
})
