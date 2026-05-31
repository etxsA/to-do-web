import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    // Dev server must be on 5173 (backend CORS allowlist).
    baseUrl: 'http://localhost:5173',
    supportFile: false,
    fixturesFolder: false,
    specPattern: 'cypress/e2e/**/*.cy.ts',
    video: false,
    defaultCommandTimeout: 12000,
  },
})
