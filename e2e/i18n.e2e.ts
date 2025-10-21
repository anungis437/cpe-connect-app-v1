import { test, expect } from '@playwright/test'

test.describe('Internationalization', () => {
  test('should switch between English and French', async ({ page }) => {
    await page.goto('/')

    // Check default language (assuming English)
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')

    // Look for language switcher
    const languageSwitcher = page.getByRole('button', { name: /language|langue/i })
      .or(page.getByRole('link', { name: /français|french/i }))
      .or(page.locator('[data-testid="language-switcher"]'))

    if (await languageSwitcher.count() > 0) {
      await languageSwitcher.first().click()

      // Should switch to French
      await page.waitForURL(/\/fr\//)
      await expect(page.locator('html')).toHaveAttribute('lang', 'fr')
    }
  })

  test('should maintain language preference across navigation', async ({ page }) => {
    // Start on French version
    await page.goto('/fr/')

    // Verify we're on French version
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr')

    // Navigate to another page (if navigation exists)
    const navLink = page.getByRole('link').first()
    
    if (await navLink.count() > 0) {
      const href = await navLink.getAttribute('href')
      
      // Only follow internal links
      if (href && (href.startsWith('/') || href.includes('/fr/'))) {
        await navLink.click()
        
        // Should maintain French language
        await expect(page.locator('html')).toHaveAttribute('lang', 'fr')
      }
    }
  })

  test('should have proper text direction for both languages', async ({ page }) => {
    // Test English (LTR)
    await page.goto('/en/')
    const bodyEn = page.locator('body')
    const dirEn = await bodyEn.getAttribute('dir')
    expect(dirEn === null || dirEn === 'ltr').toBeTruthy()

    // Test French (LTR)
    await page.goto('/fr/')
    const bodyFr = page.locator('body')
    const dirFr = await bodyFr.getAttribute('dir')
    expect(dirFr === null || dirFr === 'ltr').toBeTruthy()
  })

  test('should handle locale-specific URLs correctly', async ({ page }) => {
    // Test English URLs
    await page.goto('/en/')
    await expect(page).toHaveURL(/\/en\//)

    // Test French URLs
    await page.goto('/fr/')
    await expect(page).toHaveURL(/\/fr\//)

    // Test redirect from root (should go to default locale)
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Should redirect to a locale-specific URL
    const currentUrl = page.url()
    expect(currentUrl.includes('/en/') || currentUrl.includes('/fr/')).toBeTruthy()
  })
})