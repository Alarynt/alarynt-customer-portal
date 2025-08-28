describe('Authentication Flow', () => {
  beforeEach(() => {
    // Clear any stored authentication
    cy.clearLocalStorage()
    cy.visit('/')
  })

  it('should display the login page initially', () => {
    cy.contains('Welcome to Alarynt').should('be.visible')
    cy.contains('Your Rule Engine Customer Portal').should('be.visible')
    cy.get('#email').should('be.visible')
    cy.get('#password').should('be.visible')
    cy.get('button[type="submit"]').should('contain', 'Sign in')
  })

  it('should show validation errors for empty form', () => {
    cy.get('button[type="submit"]').click()
    cy.get('#email:invalid').should('exist')
    cy.get('#password:invalid').should('exist')
  })

  it('should show/hide password when clicking eye icon', () => {
    cy.get('#password').type('testpassword')
    cy.get('#password').should('have.attr', 'type', 'password')
    
    // Click the eye button to show password
    cy.get('#password').parent().find('button').click()
    cy.get('#password').should('have.attr', 'type', 'text')
    
    // Click again to hide password
    cy.get('#password').parent().find('button').click()
    cy.get('#password').should('have.attr', 'type', 'password')
  })

  it('should successfully login with any credentials', () => {
    cy.get('#email').type('test@example.com')
    cy.get('#password').type('password123')
    cy.get('button[type="submit"]').click()

    // Should show loading state briefly
    cy.get('button[type="submit"]').should('be.disabled')
    
    // Should redirect to dashboard after successful login
    cy.url().should('include', '/dashboard')
    cy.contains('Welcome to Alarynt').should('not.exist')
    cy.contains('Dashboard').should('be.visible')
  })

  it('should persist login state after page refresh', () => {
    cy.login()
    cy.reload()
    cy.url().should('include', '/dashboard')
    cy.contains('Demo User').should('be.visible')
  })

  it('should successfully logout', () => {
    cy.login()
    cy.logout()
  })

  it('should redirect to login after logout', () => {
    cy.login()
    cy.visit('/rules')
    cy.url().should('include', '/rules')
    
    cy.logout()
    
    // Try to visit protected route after logout
    cy.visit('/rules')
    cy.url().should('not.include', '/rules')
    cy.contains('Welcome to Alarynt').should('be.visible')
  })
})