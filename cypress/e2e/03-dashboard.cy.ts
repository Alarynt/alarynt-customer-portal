describe('Dashboard', () => {
  beforeEach(() => {
    cy.login()
    cy.visit('/dashboard')
  })

  it('should display the dashboard header and description', () => {
    cy.contains('h1', 'Dashboard').should('be.visible')
    cy.contains('Monitor your rule engine performance and activity').should('be.visible')
  })

  it('should display all stat cards with correct data', () => {
    // Check all four stat cards are present
    cy.contains('Total Rules').should('be.visible')
    cy.contains('24').should('be.visible') // Total rules count

    cy.contains('Active Rules').should('be.visible')
    cy.contains('18').should('be.visible') // Active rules count

    cy.contains('Total Actions').should('be.visible')
    cy.contains('12').should('be.visible') // Total actions count

    cy.contains('Success Rate').should('be.visible')
    cy.contains('94.2%').should('be.visible') // Success rate
  })

  it('should display the rule executions chart', () => {
    cy.contains('h3', 'Rule Executions (Last 7 Days)').should('be.visible')
    cy.get('.recharts-wrapper').first().should('be.visible')
    
    // Check chart has data points for days of the week
    cy.get('.recharts-wrapper').first().within(() => {
      cy.get('.recharts-line').should('have.length', 2) // Two lines: executions and success
    })
  })

  it('should display the action distribution pie chart', () => {
    cy.contains('h3', 'Action Distribution').should('be.visible')
    cy.get('.recharts-wrapper').last().should('be.visible')
    
    // Check pie chart is rendered
    cy.get('.recharts-wrapper').last().within(() => {
      cy.get('.recharts-pie').should('exist')
    })
  })

  it('should display recent activity section', () => {
    cy.contains('h3', 'Recent Activity').should('be.visible')
    
    // Check that activity items are displayed
    cy.contains('New rule "High Value Customer Alert" created').should('be.visible')
    cy.contains('Email notification sent to sales team').should('be.visible')
    cy.contains('Rule "Inventory Low Alert" triggered').should('be.visible')
    cy.contains('SMS notification failed to send').should('be.visible')
    cy.contains('Rule "Payment Processing" updated').should('be.visible')

    // Check that status indicators are present
    cy.get('.p-4.bg-gray-50.rounded-lg').should('have.length', 5)
    cy.contains('success').should('be.visible')
    cy.contains('warning').should('be.visible')
    cy.contains('error').should('be.visible')
    cy.contains('info').should('be.visible')
  })

  it('should have working Create Rule button', () => {
    cy.contains('button', 'Create Rule').should('be.visible').click()
    cy.url().should('include', '/rules/create')
  })

  it('should have working Create Action button', () => {
    cy.contains('button', 'Create Action').should('be.visible').click()
    cy.url().should('include', '/actions/create')
  })

  it('should navigate to activities when clicking View All', () => {
    cy.contains('a', 'View All').should('be.visible').click()
    cy.url().should('include', '/activities')
  })

  it('should display status icons correctly', () => {
    // Check that different status icons are rendered
    cy.get('.text-green-500').should('exist') // Success icons
    cy.get('.text-yellow-500').should('exist') // Warning icons
    cy.get('.text-red-500').should('exist') // Error icons
    cy.get('.text-blue-500').should('exist') // Info icons
  })

  it('should show activity timestamps', () => {
    cy.contains('2 minutes ago').should('be.visible')
    cy.contains('5 minutes ago').should('be.visible')
    cy.contains('12 minutes ago').should('be.visible')
    cy.contains('1 hour ago').should('be.visible')
    cy.contains('2 hours ago').should('be.visible')
  })

  it('should display chart tooltips on hover', () => {
    // Hover over the line chart
    cy.get('.recharts-wrapper').first().within(() => {
      cy.get('.recharts-active-dot').first().trigger('mouseover')
    })
    
    // Check if tooltip appears (this might be tricky due to dynamic rendering)
    cy.get('.recharts-tooltip-wrapper').should('exist')
  })

  it('should be responsive on mobile devices', () => {
    cy.viewport(375, 667)
    
    // Check that stats cards stack vertically on mobile
    cy.get('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4').should('be.visible')
    
    // Check that charts stack vertically on mobile
    cy.get('.grid.grid-cols-1.lg\\:grid-cols-2').should('be.visible')
    
    // All content should still be visible
    cy.contains('Dashboard').should('be.visible')
    cy.contains('Total Rules').should('be.visible')
    cy.contains('Recent Activity').should('be.visible')
  })
})