describe('Help', () => {
  beforeEach(() => {
    cy.login()
    cy.visit('/help')
  })

  it('should display the help page', () => {
    cy.contains('h1, h2', 'Help').should('be.visible')
    cy.url().should('include', '/help')
  })

  it('should show help content', () => {
    // The page should load without errors
    cy.get('body').should('be.visible')
    
    // Should have the main content area
    cy.get('.max-w-7xl').should('exist')
  })

  it('should be accessible from navigation', () => {
    cy.visit('/dashboard')
    cy.contains('nav a', 'Help').click()
    cy.url().should('include', '/help')
  })

  it('should maintain authentication', () => {
    cy.contains('Demo User').should('be.visible')
  })
})