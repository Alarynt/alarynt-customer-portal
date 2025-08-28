describe('Navigation and Routing', () => {
  beforeEach(() => {
    cy.login()
  })

  it('should navigate to all main sections from header', () => {
    const navigationItems = [
      { name: 'Dashboard', path: '/dashboard', heading: 'Dashboard' },
      { name: 'Rules', path: '/rules', heading: 'Rules Management' },
      { name: 'Actions', path: '/actions', heading: 'Actions Management' },
      { name: 'Activities', path: '/activities', heading: 'Activities' },
      { name: 'Analytics', path: '/analytics', heading: 'Analytics' },
      { name: 'Help', path: '/help', heading: 'Help & Documentation' }
    ]

    navigationItems.forEach(item => {
      cy.contains('nav a', item.name).click()
      cy.url().should('include', item.path)
      cy.contains('h1, h2', item.heading).should('be.visible')
      
      // Check that the navigation item is highlighted
      cy.contains('nav a', item.name).should('have.class', 'text-primary-600')
    })
  })

  it('should redirect root path to dashboard', () => {
    cy.visit('/')
    cy.url().should('include', '/dashboard')
  })

  it('should show active navigation state correctly', () => {
    cy.visit('/rules')
    cy.contains('nav a', 'Rules').should('have.class', 'text-primary-600')
    cy.contains('nav a', 'Dashboard').should('not.have.class', 'text-primary-600')
  })

  it('should work with browser back/forward buttons', () => {
    cy.visit('/dashboard')
    cy.contains('nav a', 'Rules').click()
    cy.url().should('include', '/rules')
    
    cy.go('back')
    cy.url().should('include', '/dashboard')
    
    cy.go('forward')
    cy.url().should('include', '/rules')
  })

  it('should display user information in header', () => {
    cy.contains('Demo User').should('be.visible')
    cy.get('.h-8.w-8.bg-primary-600.rounded-full').should('contain', 'D') // First letter of Demo User
  })

  it('should open and close user menu', () => {
    // User menu should be closed initially
    cy.contains('Profile').should('not.exist')
    
    // Click user menu button
    cy.contains('Demo User').click()
    
    // Menu should be open
    cy.contains('Profile').should('be.visible')
    cy.contains('Settings').should('be.visible')
    cy.contains('Sign out').should('be.visible')
    
    // Click outside to close
    cy.get('body').click(0, 0)
    cy.contains('Profile').should('not.exist')
  })

  it('should have working search bar', () => {
    cy.get('input[placeholder*="Search"]').should('be.visible')
    cy.get('input[placeholder*="Search"]').type('test search')
    cy.get('input[placeholder*="Search"]').should('have.value', 'test search')
  })

  it('should show notification bell', () => {
    cy.get('button').find('.lucide-bell, [data-lucide="bell"]').should('be.visible')
    cy.get('.bg-red-500.rounded-full').should('be.visible') // Notification indicator
  })

  it('should handle mobile menu toggle', () => {
    // Set mobile viewport
    cy.viewport(375, 667)
    
    // Desktop nav should be hidden
    cy.get('nav.hidden.md\\:flex').should('not.be.visible')
    
    // Mobile menu button should be visible
    cy.get('button').find('.lucide-menu, [data-lucide="menu"]').should('be.visible')
    
    // Click mobile menu
    cy.get('button').find('.lucide-menu, [data-lucide="menu"]').click()
    
    // Mobile menu should be open
    cy.get('.md\\:hidden .space-y-1 a').should('be.visible')
    cy.contains('.md\\:hidden a', 'Dashboard').should('be.visible')
    
    // Click close button
    cy.get('button').find('.lucide-x, [data-lucide="x"]').click()
    
    // Mobile menu should be closed
    cy.get('.md\\:hidden .space-y-1').should('not.exist')
  })
})