import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

for (const path of ['/', '/dev/gallery', '/nope-404']) {
  test(`axe: ${path} has no serious violations`, async ({ page }) => {
    await page.goto(path)
    await page.evaluate(() => document.fonts.ready)
    const res = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
    const serious = res.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
    expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(', ')}`)).toEqual([])
  })
}

test('security headers are present', async ({ request }) => {
  const res = await request.get('/')
  const h = res.headers()
  expect(h['content-security-policy']).toContain("frame-ancestors 'none'")
  expect(h['x-content-type-options']).toBe('nosniff')
  expect(h['x-frame-options']).toBe('DENY')
  expect(h['referrer-policy']).toBe('strict-origin-when-cross-origin')
  expect(h['permissions-policy']).toContain('camera=()')
  expect(h['strict-transport-security']).toContain('max-age=31536000')
  expect(h['x-powered-by']).toBeUndefined()
})
