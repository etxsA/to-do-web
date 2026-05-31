/// <reference types="cypress" />

/**
 * End-to-end smoke of the critical flow against the live backend:
 * login → dashboard → create list → search → command palette → logout.
 * Credentials come from cypress.env.json (gitignored) or CYPRESS_* env vars.
 */
describe('Scholarly Atelier — core flow', () => {
  const email = Cypress.env('email') as string
  const password = Cypress.env('password') as string
  const listName = `E2E List ${Date.now()}`

  it('signs in, creates a list, searches, and logs out', () => {
    cy.visit('/login')
    cy.get('[data-testid=input-email]').type(email)
    cy.get('[data-testid=input-password]').type(password, { log: false })
    cy.get('[data-testid=btn-login]').click()

    // Dashboard
    cy.contains('Welcome back', { timeout: 20000 }).should('be.visible')

    // Create a list
    cy.get('[data-testid=btn-create-list]').first().click()
    cy.get('[data-testid=input-list-name]').type(listName)
    cy.get('[data-testid=input-list-description]').type('created by cypress')
    cy.get('[data-testid=btn-save-list]').click()
    // Confirmed via the success toast (a brand-new list paginates to the end).
    cy.contains('List created', { timeout: 15000 }).should('be.visible')

    // Search finds it across pages
    cy.get('[data-testid=input-topnav-search]').type(`${listName}{enter}`)
    cy.contains('matches found', { timeout: 15000 })
    cy.contains(listName).should('be.visible')

    // Logout
    cy.get('[data-testid=btn-user-menu]').click()
    cy.get('[data-testid=btn-logout]').click()
    cy.url().should('include', '/login')
  })
})
