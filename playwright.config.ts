import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:4321',
    trace: 'on-first-retry',
  },
  webServer: {
    // --ignore-lock keeps `astro preview` in the foreground. Astro 7
    // auto-backgrounds it when it detects an AI agent (AI_AGENT, CLAUDECODE…),
    // and a backgrounded server makes the command exit, which Playwright
    // reports as "Process from config.webServer exited early".
    command: 'npm run build && npm run preview -- --ignore-lock',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
