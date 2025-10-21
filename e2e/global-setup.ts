import { chromium, FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use
  
  if (!baseURL) {
    throw new Error('Base URL not configured')
  }

  // Launch browser for setup
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  try {
    // Wait for the application to be ready
    console.log('Waiting for application to be ready...')
    await page.goto(baseURL, { timeout: 60000 })
    
    // Check if the application is responding
    await page.waitForSelector('body', { timeout: 30000 })
    
    console.log('Application is ready for testing')
    
    // Setup test data if needed
    // This could include seeding the database with test data
    
  } catch (error) {
    console.error('Global setup failed:', error)
    throw error
  } finally {
    await context.close()
    await browser.close()
  }
}

export default globalSetup