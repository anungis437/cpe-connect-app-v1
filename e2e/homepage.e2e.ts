import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should load successfully', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/')

    // Check that the page loads
    await expect(page).toHaveTitle(/CPE Connect/)
    
    // Check for main navigation elements
    await expect(page.locator('main')).toBeVisible()
    
    // Verify accessibility
    await expect(page.locator('html')).toHaveAttribute('lang')
    
    // Check for no JavaScript errors
    const errors: string[] = []
    page.on('pageerror', error => {
      errors.push(error.message)
    })
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle')
    
    // Verify no critical errors occurred
    expect(errors.filter(error => 
      !error.includes('Warning') && 
      !error.includes('DevTools')
    )).toHaveLength(0)
  })

  test('should be responsive', async ({ page }) => {
    await page.goto('/')

    // Test desktop view
    await page.setViewportSize({ width: 1920, height: 1080 })
    await expect(page.locator('main')).toBeVisible()

    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page.locator('main')).toBeVisible()

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.locator('main')).toBeVisible()
  })

  test('should have proper meta tags for SEO', async ({ page }) => {
    await page.goto('/')

    // Check for meta description
    const metaDescription = page.locator('meta[name="description"]')
    await expect(metaDescription).toHaveCount(1)

    // Check for viewport meta tag
    const viewportMeta = page.locator('meta[name="viewport"]')
    await expect(viewportMeta).toHaveCount(1)

    // Check for charset
    const charset = page.locator('meta[charset]')
    await expect(charset).toHaveCount(1)
  })
})