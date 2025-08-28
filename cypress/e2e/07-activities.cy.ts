describe('Activities', () => {
  beforeEach(() => {
    cy.login()
    cy.visit('/activities')
  })

  it('should display the activities page', () => {
    cy.contains('h1', 'Activities').should('be.visible')
    cy.url().should('include', '/activities')
  })

  it('should show activity content', () => {
    // The page should load without errors
    cy.get('body').should('be.visible')
    
    // Should have the main content area
    cy.get('.max-w-7xl').should('exist')
  })

  it('should be accessible from navigation', () => {
    cy.visit('/dashboard')
    cy.contains('nav a', 'Activities').click()
    cy.url().should('include', '/activities')
  })

  it('should maintain authentication', () => {
    cy.contains('Demo User').should('be.visible')
  })
})