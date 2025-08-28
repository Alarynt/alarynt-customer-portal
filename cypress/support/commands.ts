// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom command to login to the application
Cypress.Commands.add('login', (email: string = 'admin@example.com', password: string = 'password') => {
  cy.visit('/')
  cy.get('#email').type(email)
  cy.get('#password').type(password)
  cy.get('button[type="submit"]').click()
  cy.url().should('include', '/dashboard')
  cy.contains('Welcome to Alarynt').should('not.exist')
})

// Custom command to logout
Cypress.Commands.add('logout', () => {
  cy.get('.relative button').contains('Demo User').click()
  cy.contains('Sign out').click()
  cy.url().should('not.include', '/dashboard')
  cy.contains('Welcome to Alarynt').should('be.visible')
})

declare global {
  namespace Cypress {
    interface Chainable {
      login(email?: string, password?: string): Chainable<void>
      logout(): Chainable<void>
    }
  }
}

export {}