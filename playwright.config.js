// @ts-check
/**
 * Playwright configuration for the Faculty Application XSS suite.
 * Loads .env (if present) so URLs/credentials can live outside source control.
 */
require('dotenv').config();
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  // XSS matrices are large (fields × payloads); give each spec room to finish.
  timeout: 90 * 60 * 1000,
  expect: { timeout: 10 * 1000 },

  // The specs maintain in-process result tables, so run them serially.
  fullyParallel: false,
  workers: 1,
  retries: 0,

  reporter: [
    ['list'],
    ['html', { open: 'never' }],
  ],

  use: {
    // bypassCSP lets the alert-oracle init script run even if the app sets a CSP,
    // so detection reflects the payload's behaviour, not the harness being blocked.
    bypassCSP: true,
    ignoreHTTPSErrors: true,
    actionTimeout: 15 * 1000,
    navigationTimeout: 30 * 1000,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'off',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
